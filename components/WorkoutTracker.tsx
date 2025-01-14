'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Exercise {
  name: string;
  type: string;
  group: string;
  id: number;
  defaultSets: number;
}

interface Set {
  weight: string;
  reps: string;
  rpe: string;
}

interface ExerciseWithSets extends Exercise {
  sets: Set[];
}

interface WorkoutStatus {
  completed: boolean;
  completionDate: string | null;
}

type WorkoutsByDay = {
  [key in 1 | 2 | 3 | 4]: Exercise[];
};

const WorkoutTracker = () => {
  const [selectedMesocycle, setSelectedMesocycle] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3 | 4>(1);
  const [previousWorkouts, setPreviousWorkouts] = useState<Record<string, ExerciseWithSets[]>>({});
  const [selectedExercises, setSelectedExercises] = useState<ExerciseWithSets[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [workoutStatus, setWorkoutStatus] = useState<Record<string, WorkoutStatus>>({});

  const workoutsByDay: WorkoutsByDay = {
    1: [
      { name: 'BS Low bar', type: 'Primary', group: 'Legs', id: 3, defaultSets: 3 },
      { name: 'DB-press Incline', type: 'Primary', group: 'Chest', id: 5, defaultSets: 3 },
      { name: 'Db row dumbell', type: 'Primary', group: 'Back', id: 4, defaultSets: 3 },
      { name: 'Lat Prayers', type: 'Secondary', group: 'Back', id: 8, defaultSets: 3 },
      { name: 'Reverse Nordic C.', type: 'Secondary', group: 'Legs', id: 12, defaultSets: 2 },
      { name: 'Nordic C.', type: 'Secondary', group: 'Legs', id: 11, defaultSets: 2 },
      { name: 'Face pulls', type: 'Secondary', group: 'Shoulders', id: 6, defaultSets: 2 },
      { name: 'Baynesian', type: 'Secondary', group: 'Biceps', id: 2, defaultSets: 4 },
      { name: 'Triceps overhead', type: 'Secondary', group: 'Triceps', id: 14, defaultSets: 3 },
      { name: 'Triceps pushdown', type: 'Secondary', group: 'Triceps', id: 15, defaultSets: 2 }
    ],
    2: [
      { name: 'BS Low bar', type: 'Primary', group: 'Legs', id: 3, defaultSets: 3 },
      { name: 'Shoulder press', type: 'Primary', group: 'Shoulders', id: 13, defaultSets: 3 },
      { name: 'DB-press Incline', type: 'Primary', group: 'Chest', id: 5, defaultSets: 3 },
      { name: 'Latsdrag', type: 'Secondary', group: 'Back', id: 10, defaultSets: 2 },
      { name: 'Db row dumbell', type: 'Secondary', group: 'Back', id: 4, defaultSets: 2 },
      { name: 'Lateral delt', type: 'Secondary', group: 'Shoulders', id: 9, defaultSets: 3 },
      { name: 'Reverse Nordic C.', type: 'Secondary', group: 'Legs', id: 12, defaultSets: 2 },
      { name: 'Nordic C.', type: 'Secondary', group: 'Legs', id: 11, defaultSets: 2 },
      { name: 'Ab Wheel', type: 'Secondary', group: 'Abs', id: 1, defaultSets: 3 }
    ],
    3: [
      { name: 'BS Low bar', type: 'Primary', group: 'Legs', id: 3, defaultSets: 3 },
      { name: 'DB-press Incline', type: 'Primary', group: 'Chest', id: 5, defaultSets: 3 },
      { name: 'Latsdrag', type: 'Primary', group: 'Back', id: 10, defaultSets: 3 },
      { name: 'Reverse Nordic C.', type: 'Secondary', group: 'Legs', id: 12, defaultSets: 2 },
      { name: 'Nordic C.', type: 'Secondary', group: 'Legs', id: 11, defaultSets: 2 },
      { name: 'Face pulls', type: 'Secondary', group: 'Shoulders', id: 6, defaultSets: 2 },
      { name: 'Baynesian', type: 'Secondary', group: 'Biceps', id: 2, defaultSets: 4 },
      { name: 'Triceps overhead', type: 'Secondary', group: 'Triceps', id: 14, defaultSets: 3 },
      { name: 'Triceps pushdown', type: 'Secondary', group: 'Triceps', id: 15, defaultSets: 2 }
    ],
    4: [
      { name: 'Shoulder press', type: 'Primary', group: 'Shoulders', id: 13, defaultSets: 3 },
      { name: 'BS Low bar', type: 'Primary', group: 'Legs', id: 3, defaultSets: 3 },
      { name: 'Reverse Nordic C.', type: 'Secondary', group: 'Legs', id: 12, defaultSets: 2 },
      { name: 'Nordic C.', type: 'Secondary', group: 'Legs', id: 11, defaultSets: 2 },
      { name: 'Lat Prayers', type: 'Secondary', group: 'Back', id: 8, defaultSets: 2 },
      { name: 'Flyes', type: 'Secondary', group: 'Chest', id: 7, defaultSets: 4 },
      { name: 'Latsdrag', type: 'Secondary', group: 'Back', id: 10, defaultSets: 2 },
      { name: 'Db row dumbell', type: 'Secondary', group: 'Back', id: 4, defaultSets: 2 },
      { name: 'Lateral delt', type: 'Secondary', group: 'Shoulders', id: 9, defaultSets: 3 },
      { name: 'Baynesian', type: 'Secondary', group: 'Biceps', id: 2, defaultSets: 2 },
      { name: 'Triceps pushdown', type: 'Secondary', group: 'Triceps', id: 15, defaultSets: 2 },
      { name: 'Ab Wheel', type: 'Secondary', group: 'Abs', id: 1, defaultSets: 3 }
    ]
  };

  useEffect(() => {
    const initializeExercises = () => {
      const exercisesForDay = workoutsByDay[selectedDay];
      if (!exercisesForDay) return;

      const currentWorkoutKey = `${selectedMesocycle}-${selectedWeek}-${selectedDay}`;
      const prevWorkoutKey = `${selectedMesocycle}-${selectedWeek-1}-${selectedDay}`;
      
      const prevWorkout = previousWorkouts[prevWorkoutKey];
      const currentWorkout = previousWorkouts[currentWorkoutKey];

      if (currentWorkout) {
        setSelectedExercises(currentWorkout);
      } else {
        const initializedExercises: ExerciseWithSets[] = exercisesForDay.map(exercise => {
          const prevExercise = prevWorkout?.find(e => e.id === exercise.id);
          return {
            ...exercise,
            sets: Array(exercise.defaultSets).fill(null).map(() => ({
              weight: prevExercise?.sets[0]?.weight || '',
              reps: '',
              rpe: ''
            }))
          };
        });
        setSelectedExercises(initializedExercises);
      }
    };

    initializeExercises();
  }, [selectedMesocycle, selectedWeek, selectedDay, previousWorkouts]);

  useEffect(() => {
    try {
      const savedWorkouts = localStorage.getItem('workoutHistory');
      const savedStatus = localStorage.getItem('workoutStatus');
      if (savedWorkouts) {
        setPreviousWorkouts(JSON.parse(savedWorkouts));
      }
      if (savedStatus) {
        setWorkoutStatus(JSON.parse(savedStatus));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }, []);

  useEffect(() => {
    const total = selectedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    setSessionTotal(total);
  }, [selectedExercises]);

  const updateSetData = (exerciseIndex: number, setIndex: number, field: keyof Set, value: string) => {
    const updatedExercises = [...selectedExercises];
    const exercise = updatedExercises[exerciseIndex];
    
    if (!exercise) return;
    
    if (field === 'weight' && setIndex === 0) {
      exercise.sets.forEach(set => set.weight = value);
    } else if (field === 'reps' && exercise.sets.some(set => !set.reps)) {
      exercise.sets.forEach(set => {
        if (!set.reps) {
          set.reps = value;
        }
      });
    } else {
      if (exercise.sets[setIndex]) {
        exercise.sets[setIndex][field] = value;
      }
    }
    
    setSelectedExercises(updatedExercises);
  };

  const isWorkoutComplete = (exercises: ExerciseWithSets[]): boolean => {
    return exercises.every(exercise =>
      exercise.sets.every(set =>
        set.weight && set.reps && set.rpe
      )
    );
  };

  const clearAllWorkouts = () => {
    if (window.confirm('Are you sure you want to clear ALL workout data? This cannot be undone.')) {
      setPreviousWorkouts({});
      setWorkoutStatus({});
      
      try {
        localStorage.removeItem('workoutHistory');
        localStorage.removeItem('workoutStatus');
        setNotification({ show: true, message: 'All workout data cleared successfully', type: 'success' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
        
        // Reinitialize current workout
        const exercisesForDay = workoutsByDay[selectedDay];
        const initializedExercises = exercisesForDay.map(exercise => ({
          ...exercise,
          sets: Array(exercise.defaultSets).fill(null).map(() => ({
            weight: '',
            reps: '',
            rpe: ''
          }))
        }));
        setSelectedExercises(initializedExercises);
      } catch (e) {
        console.error('Error clearing all workout data:', e);
        setNotification({ show: true, message: 'Error clearing workout data', type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      }
    }
  };

  const saveWorkout = () => {
    const workoutKey = `${selectedMesocycle}-${selectedWeek}-${selectedDay}`;
    const updatedWorkouts = {
      ...previousWorkouts,
      [workoutKey]: selectedExercises
    };
    
    const isComplete = isWorkoutComplete(selectedExercises);
    const updatedStatus = {
      ...workoutStatus,
      [workoutKey]: {
        completed: isComplete,
        completionDate: isComplete ? new Date().toISOString() : null
      }
    };
    
    setPreviousWorkouts(updatedWorkouts);
    setWorkoutStatus(updatedStatus);
    
    try {
      localStorage.setItem('workoutHistory', JSON.stringify(updatedWorkouts));
      localStorage.setItem('workoutStatus', JSON.stringify(updatedStatus));
      setNotification({ show: true, message: 'Workout saved successfully!', type: 'success' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      setNotification({ show: true, message: 'Error saving workout', type: 'error' });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const clearWorkout = () => {
    if (window.confirm('Are you sure you want to clear this workout? This cannot be undone.')) {
      const workoutKey = `${selectedMesocycle}-${selectedWeek}-${selectedDay}`;
      const updatedWorkouts = { ...previousWorkouts };
      const updatedStatus = { ...workoutStatus };
      delete updatedWorkouts[workoutKey];
      delete updatedStatus[workoutKey];
      
      setPreviousWorkouts(updatedWorkouts);
      setWorkoutStatus(updatedStatus);
      
      try {
        localStorage.setItem('workoutHistory', JSON.stringify(updatedWorkouts));
        localStorage.setItem('workoutStatus', JSON.stringify(updatedStatus));
        setNotification({ show: true, message: 'Workout cleared successfully', type: 'success' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
        
        const exercisesForDay = workoutsByDay[selectedDay];
        const initializedExercises = exercisesForDay.map(exercise => ({
          ...exercise,
          sets: Array(exercise.defaultSets).fill(null).map(() => ({
            weight: '',
            reps: '',
            rpe: ''
          }))
        }));
        setSelectedExercises(initializedExercises);
      } catch (e) {
        console.error('Error clearing workout:', e);
        setNotification({ show: true, message: 'Error clearing workout', type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
      }
    }
  };

  const exportToPowerBI = () => {
    // Clear any existing notifications first
    setNotification({ 
      show: true, 
      message: 'Preparing PowerBI export...', 
      type: 'success' 
    });
    
    // Add a confirmation dialog
    if (!window.confirm('Export workout data to PowerBI? This will include all saved workouts.')) {
      setNotification({ show: false, message: '', type: 'success' });
      return;
    }

    try {
      interface PowerBIWorkoutRow {
        Date: string;
        Mesocycle: number;
        Week: number;
        Day: number;
        Exercise: string;
        ExerciseType: string;
        MuscleGroup: string;
        SetNumber: number;
        Weight: number;
        Reps: number;
        RPE: number;
        VolumeLoad: number;
        IsCompleted: boolean;
        CompletionDate: string;
        SessionID: string;
        ExerciseOrder: number
      }

      const totalWorkouts = Object.keys(previousWorkouts).length;

      if (totalWorkouts === 0) {
        setNotification({ 
          show: true, 
          message: 'No workout data available to export', 
          type: 'error' 
        });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
        return;
      }

      const workoutData: PowerBIWorkoutRow[] = Object.entries(previousWorkouts).flatMap(([key, exercises]) => {
        const [mesocycle, week, day] = key.split('-').map(Number);
        const status = workoutStatus[key] || { completed: false, completionDate: null };
        const sessionId = `${mesocycle}-${week}-${day}`;

        return exercises.flatMap((exercise, exerciseIndex) => 
          exercise.sets.map((set, setIndex) => ({
            Date: status.completionDate || new Date().toISOString(),
            Mesocycle: mesocycle,
            Week: week,
            Day: day,
            Exercise: exercise.name,
            ExerciseType: exercise.type,
            MuscleGroup: exercise.group,
            SetNumber: setIndex + 1,
            Weight: parseFloat(set.weight) || 0,
            Reps: parseInt(set.reps) || 0,
            RPE: parseFloat(set.rpe) || 0,
            VolumeLoad: (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0),
            IsCompleted: status.completed,
            CompletionDate: status.completionDate || '',
            SessionID: sessionId,
            ExerciseOrder: exerciseIndex + 1
          }))
        );
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(workoutData);

      // Add column widths for better readability
      ws['!cols'] = [
        { wch: 10 },  // Date
        { wch: 8 },   // Mesocycle
        { wch: 8 },   // Week
        { wch: 8 },   // Day
        { wch: 20 },  // Exercise
        { wch: 15 },  // ExerciseType
        { wch: 15 },  // MuscleGroup
        { wch: 8 },   // SetNumber
        { wch: 8 },   // Weight
        { wch: 8 },   // Reps
        { wch: 8 },   // RPE
        { wch: 10 },  // VolumeLoad
        { wch: 10 },  // IsCompleted
        { wch: 20 },  // CompletionDate
        { wch: 20 },  // SessionID
        { wch: 12 }   // ExerciseOrder
      ];

      // Add metadata for PowerBI
      ws['!powerbi'] = {
        defaultAggregation: {
          VolumeLoad: 'SUM',
          Weight: 'AVERAGE',
          Reps: 'SUM',
          RPE: 'AVERAGE'
        }
      };

      XLSX.utils.book_append_sheet(wb, ws, "PowerBI_Workout_Data");

      // Generate filename with date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `workout_data_powerbi_${currentDate}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      // Show success notification with export details
      setNotification({ 
        show: true, 
        message: `Successfully exported ${totalWorkouts} workouts to ${filename}`, 
        type: 'success' 
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);

    } catch (error) {
      console.error('Error exporting to PowerBI:', error);
      setNotification({ 
        show: true, 
        message: 'Error exporting workout data', 
        type: 'error' 
      });
      setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 3000);
    }
  };

  const getCurrentWorkoutStatus = () => {
    const workoutKey = `${selectedMesocycle}-${selectedWeek}-${selectedDay}`;
    return workoutStatus[workoutKey];
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h1 className="text-2xl font-bold text-black mb-4">Workout Tracker</h1>
        <div className="flex gap-4 mb-4">
          <select 
            className="p-2 border rounded flex-1 text-black font-medium bg-white cursor-pointer"
            value={selectedMesocycle}
            onChange={(e) => setSelectedMesocycle(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map(meso => (
              <option key={meso} value={meso}>Mesocycle {meso}</option>
            ))}
          </select>
          <select 
            className="p-2 border rounded flex-1 text-black font-medium bg-white cursor-pointer"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map(week => (
              <option key={week} value={week}>Week {week}</option>
            ))}
          </select>
          <select 
            className="p-2 border rounded flex-1 text-black font-medium bg-white cursor-pointer"
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value) as 1 | 2 | 3 | 4)}
          >
            {[1, 2, 3, 4].map(day => (
              <option key={day} value={day}>Day {day}</option>
            ))}
          </select>
        </div>

        {getCurrentWorkoutStatus() && (
          <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            getCurrentWorkoutStatus()?.completed 
              ? 'bg-green-100 border border-green-500' 
              : 'bg-yellow-100 border border-yellow-500'
          }`}>
            <div className="flex items-center gap-2">
              {getCurrentWorkoutStatus()?.completed ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Workout Completed</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-700 font-medium">Workout In Progress</span>
                </>
              )}
            </div>
            {getCurrentWorkoutStatus()?.completionDate && (
              <span className="text-gray-600">
                Completed on: {new Date(getCurrentWorkoutStatus()?.completionDate as string).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mb-4 p-4 bg-gray-100 rounded-lg">
          <div className="flex-1">
            <div className="font-medium text-gray-700">Current Session Sets</div>
            <div className="text-2xl font-bold text-black">{sessionTotal}</div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-700">Week {selectedWeek} Total Sets</div>
            <div className="text-2xl font-bold text-black">
              {Object.values(workoutsByDay).reduce((total, exercises) => 
                total + exercises.reduce((sum, exercise) => sum + exercise.defaultSets, 0)
              , 0)}
            </div>
          </div>
        </div>

        {notification.show && (
          <div className={`mb-4 p-4 rounded-lg border ${
            notification.type === 'error' 
              ? 'bg-red-100 border-red-500 text-red-700' 
              : 'bg-green-100 border-green-500 text-green-700'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={saveWorkout}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Save className="w-5 h-5" />
            Save Workout
          </button>
          <button
            onClick={exportToPowerBI}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download className="w-5 h-5" />
            Export for PowerBI
          </button>
          <button
            onClick={clearWorkout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Clear Workout
          </button>
          <button
            onClick={clearAllWorkouts}
            className="flex items-center gap-2 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900"
          >
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {selectedExercises.map((exercise, exerciseIndex) => (
          <div key={`${exercise.id}-${exerciseIndex}`} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-black">{exercise.name}</h3>
                <p className="text-gray-600">{exercise.group} - {exercise.type}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const updatedExercises = [...selectedExercises];
                    const exercise = updatedExercises[exerciseIndex];
                    if (exercise) {
                      const lastSet = exercise.sets[exercise.sets.length - 1];
                      exercise.sets.push({
                        weight: lastSet?.weight || '',
                        reps: '',
                        rpe: ''
                      });
                      setSelectedExercises(updatedExercises);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="w-5 h-5 text-green-600" />
                </button>
                {exercise.sets.length > 1 && (
                  <button
                    onClick={() => {
                      const updatedExercises = [...selectedExercises];
                      const exercise = updatedExercises[exerciseIndex];
                      if (exercise) {
                        exercise.sets.pop();
                        setSelectedExercises(updatedExercises);
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Minus className="w-5 h-5 text-red-600" />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex gap-2 items-center">
                  <span className="w-8 text-black font-medium">#{setIndex + 1}</span>
                  <input
                    type="number"
                    placeholder="kg"
                    className="p-2 border rounded w-20 text-black font-medium"
                    value={set.weight}
                    onChange={(e) => updateSetData(exerciseIndex, setIndex, 'weight', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="reps"
                    className="p-2 border rounded w-16 text-black font-medium"
                    value={set.reps}
                    onChange={(e) => updateSetData(exerciseIndex, setIndex, 'reps', e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="RPE"
                    className="p-2 border rounded w-16 text-black font-medium"
                    value={set.rpe}
                    onChange={(e) => updateSetData(exerciseIndex, setIndex, 'rpe', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutTracker;