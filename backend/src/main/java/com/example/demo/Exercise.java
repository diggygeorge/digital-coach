package com.example.demo;

public class Exercise {
    private String name;
    private int sets;
    private int reps;

    public Exercise(String name, int sets, int reps){
        this.name = name;
        this.sets = sets;
        this.reps = reps;
    }

    
    //getters

    public String getName(){
        return this.name;
    }

    public int getSets(){
        return this.sets;
    }

    public int getReps(){
        return this.reps;
    }
}