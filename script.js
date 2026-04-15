// Add these variables to your App object
App.droneOsc = null;
App.droneGain = null;
App.droneActive = false;
App.selectedDroneNote = "C";

// Update the bindEvents() method inside App
bindEvents() {
    // ... (Keep existing Metronome/Freeze bindings) ...

    // Drone Note Selection
    document.querySelectorAll('.drone-note').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.drone-note').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            this.selectedDroneNote = btn.dataset.note;
            if (this.droneActive) this.updateDrone(); // Live update pitch if playing
        };
    });

    // Drone Play/Pause
    document.getElementById('drone-toggle').onclick = () => {
        this.droneActive = !this.droneActive;
        const btn = document.getElementById('drone-toggle');
        btn.innerText = this.droneActive ? 'Stop Drone' : 'Play Drone';
        this.droneActive ? this.startDrone() : this.stopDrone();
    };

    // Drone Volume
    document.getElementById('drone-volume').oninput = (e) => {
        if (this.droneGain) {
            this.droneGain.gain.setTargetAtTime(e.target.value, this.audioCtx.currentTime, 0.1);
        }
    };
},

// Add these Drone methods to the App object
startDrone() {
    if (!this.audioCtx) this.startEngine();
    
    // Create fundamental and a harmonic for a "rich drone" feel
    this.droneOsc = this.audioCtx.createOscillator();
    this.droneGain = this.audioCtx.createGain();
    
    const freq = this.noteToFreq(this.selectedDroneNote);
    this.droneOsc.type = 'sawtooth'; // Richer in harmonics
    this.droneOsc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    
    // Low pass filter to remove harshness (makes it "Drone" like, not "Buzzer" like)
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400; 

    const vol = document.getElementById('drone-volume').value;
    this.droneGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.droneGain.gain.linearRampToValueAtTime(vol, this.audioCtx.currentTime + 1); // Smooth Fade In

    this.droneOsc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.audioCtx.destination);
    
    this.droneOsc.start();
},

stopDrone() {
    if (this.droneGain) {
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
        setTimeout(() => {
            if (this.droneOsc) this.droneOsc.stop();
        }, 500);
    }
},

updateDrone() {
    const freq = this.noteToFreq(this.selectedDroneNote);
    if (this.droneOsc) {
        this.droneOsc.frequency.setTargetAtTime(freq, this.audioCtx.currentTime, 0.2);
    }
},

noteToFreq(note) {
    const frequencies = {
        "C": 130.81, "C#": 138.59, "D": 146.83, "D#": 155.56, 
        "E": 164.81, "F": 174.61, "F#": 185.00, "G": 196.00, 
        "G#": 207.65, "A": 220.00, "A#": 233.08, "B": 246.94
    };
    return frequencies[note];
}
