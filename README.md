# digital-coach
Web app/fitness platform which assists in tracking nutrition and fitness goals


## HOW TO RUN
In CMD 1: run `mvnw.cmd spring-boot:run` in backend.  
In CMD 2: run `npm run dev` in frontend. Then open the link ex. `http://localhost:5173/` in a browser. (will need to do `npm install` the first time to intall it obv)


## EXPLANATION
`WorkoutForm.jsx` in frontend is sending an HTTP request to the backend.


Lines 7-13 generate a form state object:
```javascript
const [form, setForm] = useState({
  userGoal: "",
  userLevel: "",
  numDays: 3,
  targetMuscles: [],
  availableEquipment: [], // comes from image recognition API (Danny)
});
```


This object is then sent as JSON to the backend in lines 32-36:
```javascript
const res = await fetch("http://digital-coach-production-de3f.up.railway.app/api/workout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});
```


All the front end needs to do is complete the first object (see the example file) then send it with the second code block in the final version.(if i am correct and everything is working :)
