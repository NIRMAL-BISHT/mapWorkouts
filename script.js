'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const options = document.getElementsByTagName('option');
// let map;
// let mapE;
class Workout {
  date = new Date();
  id = new Date().getTime().toString().slice(-10);
  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
    this.type = 'running';
    this._setDescription();
  }
  calcPace() {
    //km/min
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(distance, duration, coords, elevGain) {
    super(distance, duration, coords);
    this.elevGain = elevGain;
    this.calcSpeed();
    this.type = 'cycling';
    this._setDescription();
  }
  calcSpeed() {
    //
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}
//////
class App {
  #mapE;
  #map;
  #workouts = [];

  constructor() {
    ///get user position
    this._getPosition();
    //Get data from local storage
    this._getLocalStorage();
    // containerWorkouts.addEventListener('dblclick', this._editForm.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    containerWorkouts.addEventListener('click', e => {
      const element = e.target.closest('.workout');
      if (!element) return;
      const coordinates = this.#workouts.find(curr => {
        return curr.id === element.dataset.id;
      }).coords;

      this.#map.setView(coordinates, 13, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
    });
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert('Cannot access your location');
      });
    }
  }
  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderMarker(work);
    });
  }
  _showForm(mapEvent) {
    this.#mapE = mapEvent;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    //Taking input from fields
    e.preventDefault();
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    const { lat, lng } = this.#mapE.latlng;
    let workout;
    //Helper function
    const validInputs = (...inputs) => {
      return inputs.every(input => {
        return Number.isFinite(input);
      });
    };

    const isPositive = (...inputs) => inputs.every(input => input > 0);
    // Check the type of workput and create workout accordingly
    if (type === 'running') {
      const cadence = Number(inputCadence.value);
      if (
        !validInputs(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      ) {
        alert('Input have to be positive numbers');
        return;
      }
      workout = new Running(distance, duration, [lat, lng], cadence);
    }
    if (type === 'cycling') {
      const elevation = Number(inputElevation.value);
      if (
        !validInputs(distance, duration, elevation) ||
        !isPositive(distance, duration)
      ) {
        alert('Input have to be positive numbers');
        return;
      }
      workout = new Cycling(distance, duration, [lat, lng], elevation);
    }
    this.#workouts.push(workout);
    this._renderMarker(workout);
    this._renderWorkouts(workout);
    form.classList.add('hidden');
    this._setLocalStorage();
    inputDistance.value = inputDuration.value = inputCadence.value = '';
  }
  // _editForm(e) {
  //   const element = e.target.closest('.workout');
  //   if (!element) return;
  //   const selectedIndex = this.#workouts.findIndex(work => {
  //     return work.id === element.dataset.id;
  //   });
  //   const selected = this.#workouts[selectedIndex];
  //   console.log(selected);
  //   this._showForm();
  //   inputDistance.value = selected.distance;
  //   inputDuration.value = selected.duration;
  //   if (selected.type === 'running') {
  //     inputCadence.value = selected.cadence;
  //   }
  //   if (selected.type === 'cycling') {
  //     inputElevation.value = selected.elevGain;
  //   }
  //   this.#workouts.splice(selectedIndex, 1);
  //   form.addEventListener('submit', this._editWorkoutForm.bind(this));
  //   console.log(this.#workouts);
  //   element.style.display = 'none';
  // }
  // _editWorkoutForm(e, workout) {
  //   e.preventDefault();
  //   const type = inputType.value;
  //   const distance = Number(inputDistance.value);
  //   const duration = Number(inputDuration.value);
  //   const [lat, lng] = workout.coords;
  //   //Helper function
  //   const validInputs = (...inputs) => {
  //     return inputs.every(input => {
  //       return Number.isFinite(input);
  //     });
  //   };

  //   const isPositive = (...inputs) => inputs.every(input => input > 0);
  //   // Check the type of workput and create workout accordingly
  //   if (type === 'running') {
  //     const cadence = Number(inputCadence.value);
  //     if (
  //       !validInputs(distance, duration, cadence) ||
  //       !isPositive(distance, duration, cadence)
  //     ) {
  //       alert('Input have to be positive numbers');
  //       return;
  //     }
  //     workout = new Running(distance, duration, [lat, lng], cadence);
  //   }
  //   if (type === 'cycling') {
  //     const elevation = Number(inputElevation.value);
  //     if (
  //       !validInputs(distance, duration, elevation) ||
  //       !isPositive(distance, duration)
  //     ) {
  //       alert('Input have to be positive numbers');
  //       return;
  //     }
  //     workout = new Cycling(distance, duration, [lat, lng], elevation);
  //   }
  //   this.#workouts.push(workout);
  //   this._renderMarker(workout);
  //   this._renderWorkouts(workout);
  //   form.classList.add('hidden');
  //   this._setLocalStorage();
  //   inputDistance.value = inputDuration.value = inputCadence.value = '';
  // }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkouts(work);
    });
  }

  _renderWorkouts(workout) {
    const html = ` <li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
      <h2 class="workout__title"> ${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${
          workout.type === 'running'
            ? `${workout.pace.toFixed(1)}`
            : `${workout.speed.toFixed(1)}`
        }</span>
        <span class="workout__unit">${
          workout.type === 'running' ? 'MIN/KM' : 'KM/HR'
        }</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${
          workout.type === 'running'
            ? `${workout.cadence}`
            : `${workout.elevGain}`
        }</span>
        <span class="workout__unit">${
          workout.type === 'running' ? 'SPM' : 'M'
        }</span>
      </div>
    </li>`;
    form.insertAdjacentHTML('afterend', html);
  }
  _renderMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();
  }
}
const app = new App();
///////////////////////////////////////////Workout Architecture

// const runnning1 = new Running(45, 12, [23, 12], 3);
// const cycling1 = new Cycling(41, 18, [23, 4], 5);
// console.log(runnning1);
// console.log(cycling1);
