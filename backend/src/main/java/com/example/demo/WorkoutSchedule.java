package com.example.demo;

import java.util.*;

public class WorkoutSchedule {
    private List<Workout.Day> days; //these are the days of the individual workouts
    private List<Workout> workouts;

    public WorkoutSchedule(){
        //TODO
    }

    //getters

    public List<Workout.Day> getDays(){
        return this.days;
    }

    public List<Workout> getWorkouts(){
        return this.workouts;
    }
}