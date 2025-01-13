'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const WorkoutTracker = () => {
  const [selectedMesocycle, setSelectedMesocycle] = useState(1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [previousWorkouts, setPreviousWorkouts] = useState({});
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [workoutStatus, setWorkoutStatus] = useState({});

  const workoutsByDay = {
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

  // Initialize exercises when component mounts and when day changes
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
        const initializedExercises = exercisesForDay.map(exercise => {
          const prevExercise = prevWorkout?.find(e => e.id === exercise.id);
          return {
            ...exercise,
            sets: Array(exercise.defaultSets).fill().map(() => ({
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
  }, [selectedMesocycle, selectedWeek, selectedDay, previousWorkouts, workoutsByDay]);

  // Load saved data from localStorage
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

  // Calculate totals
  useEffect(() => {
    const total = selectedExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    setSessionTotal(total);
  }, [selectedExercises]);

  const updateSetData = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...selectedExercises];
    const exercise = updatedExercises[exerciseIndex];
    
    if (field === 'weight' && setIndex === 0) {
      exercise.sets.forEach(set => set.weight = value);
    } else if (field === 'reps' && exercise.sets.some(set => !set.reps)) {
      exercise.sets.forEach(set => {
        if (!set.reps) {
          set.reps = value;
        }
      });
    } else {
      exercise.sets[setIndex][field] = value;
    }
    
    setSelectedExercises(updatedExercises);
  };

  const isWorkoutComplete = (exercises) => {
    return exercises.every(exercise =>
      exercise.sets.every(set =>
        set.weight && set.reps && set.rpe
      )
    );
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
          sets: Array(exercise.defaultSets).fill().map(() => ({
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

  const exportToExcel = () => {
    const workoutData = Object.entries(previousWorkouts).flatMap(([key, exercises]) => {
      const [mesocycle, week, day] = key.split('-');
      const status = workoutStatus[key] || { completed: false, completionDate: null };
      
      return exercises.flatMap(exercise => 
        exercise.sets.map((set, setIndex) => ({
          Mesocycle: mesocycle,
          Week: week,
          Day: day,
          Exercise: exercise.name,
          'Exercise Type': exercise.type,
          'Muscle Group': exercise.group,
          'Set Number': setIndex + 1,
          Weight: set.weight,
          Reps: set.reps,
          RPE: set.rpe,
          Completed: status.completed ? 'Yes' : 'No',
          'Completion Date': status.completionDate ? new Date(status.completionDate).toLocaleDateString() : ''
        }))
      );
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(workoutData);
    XLSX.utils.book_append_sheet(wb, ws, "Workout Data");
    XLSX.writeFile(wb, `workout_data_${new Date().toISOString().split('T')[0]}.xlsx`);
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
            onChange={(e) => setSelectedDay(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map(day => (
              <option key={day} value={day}>Day {day}</option>
            ))}
          </select>
        </div>

        {getCurrentWorkoutStatus() && (
          <div className={`mb-4 p-4 rounded-lg flex items-center justify-between ${
            getCurrentWorkoutStatus().completed 
              ? 'bg-green-100 border border-green-500' 
              : 'bg-yellow-100 border border-yellow-500'
          }`}>
            <div className="flex items-center gap-2">
              {getCurrentWorkoutStatus().completed ? (
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
            {getCurrentWorkoutStatus().completionDate && (
              <span className="text-gray-600">
                Completed on: {new Date(getCurrentWorkoutStatus().completionDate).toLocaleDateString()}
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
            onClick={exportToExcel}
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
                    const lastSet = exercise.sets[exercise.sets.length - 1];
                    exercise.sets.push({
                      weight: lastSet?.weight || '',
                      reps: '',
                      rpe: ''
                    });
                    setSelectedExercises(updatedExercises);
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
                      exercise.sets.pop();
                      setSelectedExercises(updatedExercises);
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