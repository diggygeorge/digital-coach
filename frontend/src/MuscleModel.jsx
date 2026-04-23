import { useState, useEffect } from "react";


const BLUE = "#3B4FE4";
const BLUE_LIGHT = "#eef0fd";
const BG = "#f4f5f7";
const WHITE = "#ffffff";
const TEXT = "#1a1a2e";
const TEXT_MUTED = "#6b7280";
const BORDER = "#e5e7eb";


const muscles = {
  front: [
    { id: "chest", name: "Chest", BodyParts: "CHEST", x: 75, y: 28 },
    { id: "abdominals", name: "Abdominals", BodyParts: "CORE", x: 73.5, y: 40 },
    { id: "shoulders", name: "Shoulders", BodyParts: "SHOULDERS", x: 17, y: 25 },
    { id: "biceps", name: "Biceps", BodyParts: "BICEPS", x: 21, y: 33 },
    { id: "forearms", name: "Forearms", BodyParts: "FOREARMS", x: 15, y: 44 },
    { id: "quadriceps", name: "Quadriceps", BodyParts: "LEGS", x: 80, y: 61 },
    { id: "adductors", name: "Adductors", BodyParts: "LEGS", x: 75, y: 55 },
    { id: "calves", name: "Calves", BodyParts: "CALVES", x: 77, y: 79 },
  ],
  back: [
    { id: "traps", name: "Traps", BodyParts: "BACK", x: 73, y: 25 },
    { id: "lats", name: "Lats", BodyParts: "BACK", x: 21, y: 27 },
    { id: "lower_back", name: "Lower Back", BodyParts: "BACK", x: 73.5, y: 42 },
    { id: "middle_back", name: "Middle Back", BodyParts: "BACK", x: 73.5, y: 35 },
    { id: "glutes", name: "Glutes", BodyParts: "GLUTES", x: 23, y: 50 },
    { id: "hamstrings", name: "Hamstrings", BodyParts: "LEGS", x: 70, y: 60 },
    { id: "abductors", name: "Abductors", BodyParts: "LEGS", x: 20, y: 45 },
    { id: "neck", name: "Neck", BodyParts: "NECK", x: 69.5, y: 17 },
    { id: "triceps", name: "Triceps", BodyParts: "TRICEPS", x: 20, y: 33 },
  ],
};


const mockExercises = {
  CHEST: ["Bench Press", "Push-ups", "Chest Flyes"],
  CORE: ["Crunches", "Plank", "Leg Raises"],
  SHOULDERS: ["Overhead Press", "Lateral Raises"],
  BICEPS: ["Bicep Curls", "Hammer Curls"],
  FOREARMS: ["Wrist Curls", "Reverse Curls"],
  LEGS: ["Squats", "Leg Press", "Lunges"],
  CALVES: ["Calf Raises", "Jump Rope"],
  BACK: ["Pull-ups", "Lat Pulldown", "Rows"],
  GLUTES: ["Hip Thrusts", "Bulgarian Split Squats"],
  TRICEPS: ["Tricep Dips", "Skull Crushers"],
  NECK: ["Neck Flexion", "Resistance Band Neck Work"],
};


async function fetchExercises(BodyParts) {
  try {
    const res = await fetch(`http://digital-coach-production-de3f.up.railway.app/api/exercises?muscle=${BodyParts}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data;
  } catch {
    return mockExercises[BodyParts] ?? [];
  }
}


export default function MuscleModel() {
  const [isFront, setIsFront] = useState(true);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(false);


  const currentMuscles = isFront ? muscles.front : muscles.back;


  useEffect(() => {
    if (!selectedMuscle) {
      setExerciseList([]);
      return;
    }
    const muscle = currentMuscles.find((m) => m.id === selectedMuscle);
    if (!muscle) return;


    setLoading(true);
    fetchExercises(muscle.BodyParts).then((exercises) => {
      setExerciseList(exercises);
      setLoading(false);
    });
  }, [selectedMuscle]);


  const selectedMuscleData = currentMuscles.find((m) => m.id === selectedMuscle);


  return (
    <div style={{
      display: "flex",
      gap: "2rem",
      padding: "2rem",
      background: BG,
      minHeight: "100vh",
      fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
      boxSizing: "border-box",
    }}>


      {/* Left - body model */}
      <div style={{ width: "420px", flexShrink: 0 }}>


        {/* Toggle */}
        <div style={{ marginBottom: "1rem", display: "flex", gap: "8px" }}>
          {["Front", "Back"].map((label) => {
            const active = label === "Front" ? isFront : !isFront;
            return (
              <button
                key={label}
                onClick={() => setIsFront(label === "Front")}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: `1.5px solid ${active ? BLUE : BORDER}`,
                  background: active ? BLUE : WHITE,
                  color: active ? WHITE : TEXT_MUTED,
                  fontSize: "13px",
                  fontWeight: active ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>


        {/* Image + dots */}
        <div style={{
          position: "relative",
          background: WHITE,
          borderRadius: "16px",
          border: `1px solid ${BORDER}`,
          padding: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <img
            src={isFront ? "/front.png" : "/back.png"}
            alt="muscle model"
            style={{ width: "100%", display: "block", borderRadius: "8px" }}
          />


          {currentMuscles.map((muscle) => {
            const isRight = muscle.x >= 50;
            const isSelected = selectedMuscle === muscle.id;
            const lineWidthMap = {
              shoulders: 50,
              biceps: 50,
              forearms: 45,
              quadriceps: 80,
              abductors: 80,
              lats: 100,
              triceps: 45,
            };
            const lineWidth = lineWidthMap[muscle.id] ?? 120;


            return (
              <div
                key={muscle.id}
                onClick={() => setSelectedMuscle(muscle.id)}
                style={{
                  position: "absolute",
                  left: `${muscle.x}%`,
                  top: `${muscle.y}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: isRight ? "row" : "row-reverse",
                  cursor: "pointer",
                  gap: 0,
                }}
              >
                {/* Dot */}
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: isSelected ? BLUE : WHITE,
                  border: `2px solid ${isSelected ? BLUE : "#aab0c0"}`,
                  flexShrink: 0,
                  zIndex: 2,
                  boxShadow: isSelected ? `0 0 0 3px ${BLUE_LIGHT}` : "none",
                  transition: "all 0.15s ease",
                }} />


                {/* Dotted line */}
                <div style={{
                  width: `${lineWidth}px`,
                  borderTop: `1.5px dashed ${isSelected ? BLUE : "#aab0c0"}`,
                  flexShrink: 0,
                  transition: "border-color 0.15s ease",
                }} />


                {/* Label */}
                <span style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  color: isSelected ? BLUE : TEXT,
                  background: isSelected ? BLUE_LIGHT : WHITE,
                  padding: "2px 7px",
                  borderRadius: "4px",
                  whiteSpace: "nowrap",
                  border: `1px solid ${isSelected ? BLUE : BORDER}`,
                  transition: "all 0.15s ease",
                }}>
                  {muscle.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>


      {/* Right - exercise panel */}
      <div style={{ flex: 1 }}>
        {selectedMuscle && selectedMuscleData ? (
          <div style={{
            background: WHITE,
            borderRadius: "16px",
            border: `1px solid ${BORDER}`,
            padding: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: BLUE_LIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}>
                💪
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", color: TEXT, fontWeight: "600" }}>
                  {selectedMuscleData.name}
                </h2>
                <p style={{ margin: 0, fontSize: "12px", color: TEXT_MUTED }}>
                  {selectedMuscleData.BodyParts}
                </p>
              </div>
            </div>


            {/* Exercise list */}
            {loading ? (
              <p style={{ color: TEXT_MUTED, fontSize: "14px" }}>Loading exercises...</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {exerciseList.map((ex, i) => (
                  <div
                    key={ex}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: `1px solid ${BORDER}`,
                      background: BG,
                    }}
                  >
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: BLUE,
                      color: WHITE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: "14px", color: TEXT, fontWeight: "500" }}>
                      {ex}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: WHITE,
            borderRadius: "16px",
            border: `1px solid ${BORDER}`,
            padding: "48px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            color: TEXT_MUTED,
          }}>
            <div style={{ fontSize: "40px" }}>🫀</div>
            <p style={{ margin: 0, fontSize: "14px" }}>Select a muscle to see exercises</p>
          </div>
        )}
      </div>


    </div>
  );
}

