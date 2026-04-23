package com.example.demo;

import java.util.*;

public class Workout {
    private Day day;
    private List<Exercise> exerciseList;

    public enum Day{
        MO,
        TU,
        WE,
        TH,
        FR,
        SA,
        SU;
    }
    
    public Workout(){
        this.exerciseList = new ArrayList<Exercise>();
    }

    //getters

    public Day getDay(){
        return this.day;
    }

    public List<Exercise> getExerciseList(){
        return this.exerciseList;
    }

    public void addExercise(String exercise){
        Exercise actualExercise = new Exercise(exercise, 3, 10);
        this.exerciseList.add(actualExercise);
    }
}