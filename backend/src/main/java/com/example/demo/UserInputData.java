package com.example.demo;

import java.util.*;

public class UserInputData {
    private UserGoalEnum userGoal;
    private UserLevelEnum userLevel;
    private int numDays;
    private String[] targetMuscles;
    private Set<String> availableEquipment;


    public enum UserGoalEnum {
        STRENGTH,
        MUSCLE,
        BOTH;
    }

    public enum UserLevelEnum {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED;
    }

    //make constructor when I know how to get the targetMuscles and availableEquipment
    //information from other people
    public UserInputData(){
        //TODO
    }

    //dont need setters (except this one) cause object doesn't need to be mutable (mostly)

    public void setAvailableEquipment(Set<String> equipment) {
        this.availableEquipment = equipment;
    }


    //Getters
    public UserGoalEnum getUserGoal(){
        return this.userGoal;
    }

    public UserLevelEnum getUserLevel(){
        return this.userLevel;
    }

    public int getNumDays(){
        return this.numDays;
    }

    public String[] getTargetMuscles(){
        return this.targetMuscles;
    }

    public Set<String> getAvailableEquipment(){
        return this.availableEquipment;
    }

}