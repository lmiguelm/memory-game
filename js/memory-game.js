const game = {
  state: {
    playMobile:  document.getElementById('play-mobile'),
    endMobile:  document.getElementById('end-mobile'),

    playDesktop: document.getElementById('play-desktop'),
    endDesktop: document.getElementById('end-desktop'),
      
    ledsComputer: [],
    panelComputer: [],
    ledsPlayer: [],
    panelPlayer: [],

    maxCombinatios: 5,
    combinationMaxPosition: 8,

    computerCombination: [],
    computerCurrentCombination: -1,
    
    playerCombination: [],
    playerCurrentCombination: -1,

    audio: {
      start: 'start.mp3',
      complete: 'complete.mp3',
      fail: 'fail.mp3',
      combinations: [ '0.mp3', '1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3' ],
    }
  },

  loadAudio(filename) {
    const file = `https://lmiguelm.github.io/memory-game/audio/${filename}?cb=${new Date().getTime()}`;
    const audio = new Audio(file);
    audio.load();
    return audio;
  },

  loadAudios() { 
    if (typeof(this.state.audio.start) == "object") return

    this.state.audio.start = this.loadAudio(this.state.audio.start)
    this.state.audio.complete = this.loadAudio(this.state.audio.complete)
    this.state.audio.fail = this.loadAudio(this.state.audio.fail)
    this.state.audio.combinations = this.state.audio.combinations.map ( (audio) => this.loadAudio(audio))
  },
  

  async startGame(play, end) {
    // mudando classes do botão de inicar e parar de jogar...
    this.state.playMobile.classList.add('hide-button');
    this.state.endMobile.classList.remove('hide-button');

    this.state.playDesktop.classList.add('hide-button');
    this.state.endDesktop.classList.remove('hide-button');

    // carregando os audios do jogo
    this.loadAudios();
  
    // pegando os elementos do jogo...
    this.loadComputerPanel();
    this.loadPlayerPanel();

    // som de inicio do jogo...
    await this.state.audio.start.play();

    this.goComputer();
  },

  async resetGame() {
    window.location.reload();
  },

  async gameOver() {

    this.turnOffLights();
  
    // som de final do jogo...
    await this.state.audio.fail.play();

    this.flashAllLeds('ledIncorrect', 'buttonIncorrect');

    await new Promise(() => {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });
  },
  
  loadComputerPanel() { 
    this.state.ledsComputer = document.querySelectorAll('.led-computer');
    this.state.panelComputer = document.querySelectorAll('.button-cumputer');
  },
  
  loadPlayerPanel() {
    this.state.ledsPlayer = document.querySelectorAll('.led-player');
    this.state.panelPlayer = document.querySelectorAll('.button-player');

    this.state.panelPlayer.forEach((element, index) => {
      element.addEventListener('click', () => this.playerClick(element, index));
    })
  },

  playerClick(element, index) {
    if(element.classList.contains('block')) return;

    this.state.audio.combinations[index].play();
    
    this.checkCombination(index);
  },

  checkCombination(value) {
    this.state.playerCurrentCombination++;
    this.state.playerCombination.push(value);

    console.log('player', this.state.playerCombination);
    console.log('computer', this.state.computerCombination);

    if(this.state.playerCombination.toString() == this.state.computerCombination.slice(0, this.state.playerCombination.length)) {
      
      console.log('playerCurrentCombination', this.state.playerCurrentCombination);

      if(this.state.playerCurrentCombination == this.state.maxCombinatios) {
        this.winGame();
        return;
      } 

      this.state.playerCombination.map((combination, index) => {
        this.state.ledsPlayer[index].classList.add('pontoCorreto'); 
      });

      this.state.panelPlayer[value].style.animation = 'buttonCorrect .4s';
      setTimeout(() => this.state.panelPlayer[value].style.animation = '', 300);

      if(this.state.playerCurrentCombination === this.state.computerCurrentCombination) {

        this.state.playerCombination = [];
        this.state.playerCurrentCombination = -1;

        this.state.panelPlayer.forEach(element => {
          element.classList.add('block');
        });

        this.goComputer();
      } 

    } else {
      new Promise(resolve => {
        this.state.playerCombination.map((combination, index) => {
          this.state.ledsPlayer[index].classList.remove('pontoCorreto'); 
        });

        this.state.ledsPlayer[this.state.playerCurrentCombination].style.animation = 'ledIncorrect .4s';
        this.state.panelPlayer[value].style.animation = 'buttonIncorrect .4s';
        setTimeout(() => {
          resolve(this.gameOver());
        }, 400);
      });
    }
    
  },

  turnOffLights() {
    this.state.ledsPlayer.forEach(element => {
      element.classList.remove('pontoCorreto');
      element.style.animation = '';
    });
    this.state.ledsComputer.forEach(element => {
      element.classList.remove('pontoCorreto');
      element.style.animation = '';
    });
    this.state.panelPlayer.forEach(element => {
      element.classList.remove('pontoCorreto');
      element.style.animation = '';
    });
    this.state.panelComputer.forEach(element => {
      element.classList.remove('pontoCorreto');
      element.style.animation = '';
    });
  },

  winGame() {

    this.state.audio.complete.play();
    this.flashAllLeds('ledCorrect', 'buttonCorrect');
    
  },

  random() {
    return Math.floor((Math.random() * this.state.combinationMaxPosition) + 1);
  },

  async goComputer() {
    setTimeout(() => {

      const random = this.random();
      this.state.computerCombination.push(random);
      this.state.computerCurrentCombination++;

      this.state.computerCombination.forEach((combination, index) => {

        this.state.panelComputer[combination].style.animation = '';
        this.state.ledsComputer[index].style.animation = `ledCorrect .4s infinite`; 

        setTimeout(() => {
          this.state.ledsComputer[index].style.animation = ``; 
          this.state.ledsComputer[index].classList.add('pontoCorreto'); 
          this.state.panelComputer[combination].style.animation = 'buttonCorrect .5s';
          setTimeout(() => this.state.panelComputer[combination].style.animation = '', 300);
          this.state.audio.combinations[combination].play();

        }, 500 * (index + 1));
        
      });
    
      setTimeout(() => {
        this.state.panelPlayer.forEach(element => {
          element.classList.remove('block');
        });
      }, 600 * (this.state.computerCurrentCombination + 1));

    }, 1500);
  },

  flashAllLeds(led, button) {

    this.state.endMobile.style.animation = `${button} .4s infinite`;
    this.state.endDesktop.style.animation = `${button} .4s infinite`;
    if(led == 'ledIncorrect') {
      this.state.endMobile.innerText = 'PERDEU';
      this.state.endDesktop.innerText = 'PERDEU';
    } else {
      this.state.endDesktop.innerText = 'PARABÉNS';
      this.state.endMobile.innerText = 'PARABÉNS';
    }

    this.state.ledsComputer.forEach((element, index) => {
      element.classList.remove('pontoCorreto');
      this.state.ledsPlayer[index].classList.remove('pontoCorreto');
      
      element.style.animation = `${led} .4s infinite`
      this.state.ledsPlayer[index].style.animation = `${led} .4s infinite`;   
    });

    this.state.panelComputer.forEach((element, index) => {
      element.style.animation = `${button} .4s infinite`;
      this.state.panelPlayer[index].style.animation = `${button} .4s infinite`;     
    });     
  }
}

export default game;