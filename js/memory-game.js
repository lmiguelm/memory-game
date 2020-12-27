const game = {
  state: {
    buttonPlay:  document.getElementById('play'),
    buttonEnd:  document.getElementById('end'),
      
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
    const file = `../audio/${filename}?cb=${new Date().getTime()}`;
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
    play.classList.add('hide-button');
    end.classList.remove('hide-button');

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
    // mudando classes do botão de inicar e parar de jogar...
    this.state.buttonPlay.classList.remove('hide-button');
    this.state.buttonEnd.classList.add('hide-button');

    // som de final do jogo...
    await this.state.audio.fail.play();

    this.state.ledsComputer.forEach(element => {
      element.style.animation = 'ledIncorrect .6s infinite';
    });

    this.state.panelComputer.forEach(element => {
      element.style.animation = 'buttonIncorrect .6s infinite';
    });

    await new Promise(() => {
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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

    this.state.ledsPlayer.forEach(element => {
      element.classList.remove('pontoCorreto');
      element.style.animation = 'ledCorrect .4s infinite';
    });
    this.state.panelPlayer.forEach(element => {
      element.style.animation = 'buttonCorrect .4s infinite';
    });

    this.state.ledsComputer.forEach(element => {
      element.classList.remove('pontoCorreto');
      element.style.animation = 'ledCorrect .4s infinite';
    });
    this.state.panelComputer.forEach(element => {
      element.style.animation = 'buttonCorrect .4s infinite';
    });
  },

  random() {
    return Math.floor((Math.random() * this.state.combinationMaxPosition) + 1);
  },

  async goComputer() {
    setTimeout(() => {
      const random = this.random();
      this.state.computerCombination.push(random);
      this.state.computerCurrentCombination++;

      const teste = new Promise(resolve => {
        this.state.computerCombination.forEach((combination, index) => {

          this.state.panelComputer[combination].style.animation = '';
          this.state.ledsComputer[index].classList.add('pontoCorreto'); 
          setTimeout(() => {
            this.state.panelComputer[combination].style.animation = 'buttonCorrect .5s';
            setTimeout(() => this.state.panelComputer[combination].style.animation = '', 300);
            this.state.audio.combinations[combination].play();
          }, 500 * (index + 1));
          
        });
      });

      setTimeout(() => {
        this.state.panelPlayer.forEach(element => {
          element.classList.remove('block');
        });
      }, 600 * (this.state.computerCurrentCombination + 1));

    }, 1500);
  },
}

export default game;