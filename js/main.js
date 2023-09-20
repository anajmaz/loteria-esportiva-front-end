fetch('../config.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao carregar o arquivo JSON');
    }
    return response.json();
  })
  .then(configData => {
    console.log(configData);
    const valorantTeams = document.querySelector('.valorant-teams');
    const buttonBet = document.querySelector('.button-bet');

    var apostas = [];

    configData.jogos.map((jogo) => {
      const gameDiv = document.createElement('div');
      const versusSpan = document.createElement('span');

      versusSpan.classList.add('span-gray');
      versusSpan.textContent = "vs";

      valorantTeams.appendChild(gameDiv);

      const betInput = document.createElement('input');
      betInput.classList.add('bet-quantity');
      betInput.type = 'number';
      betInput.name = 'bet-quantity';
      betInput.placeholder = '0';
      betInput.min = 0;
      betInput.dataset.valorAposta = jogo.valorAposta;

      gameDiv.classList.add('team');

      const homeTeamDiv = createTeamDiv(jogo.times[0].time, jogo.times[0].logo);
      const awayTeamDiv = createTeamDiv(jogo.times[1].time, jogo.times[1].logo);
      
      jogo.times.map((time, index) => {
        gameDiv.appendChild(homeTeamDiv);
        gameDiv.appendChild(versusSpan);
        gameDiv.appendChild(awayTeamDiv);

        homeTeamDiv.addEventListener('click', () => {
          if (index === 0) {
            homeTeamDiv.classList.add('active');
            awayTeamDiv.classList.remove('active');
            jogo.times[index].active = true;
            jogo.times[1].active = false;
          }

          if (time.active) gameDiv.appendChild(betInput);

          updateButtonBetState();
        });

        awayTeamDiv.addEventListener('click', () => {
          if (index === 1) {
            awayTeamDiv.classList.add('active');
            homeTeamDiv.classList.remove('active');
            jogo.times[index].active = true;
            jogo.times[0].active = false;
            console.log(jogo.times[index].active);
          }

          if (time.active) gameDiv.appendChild(betInput);

          updateButtonBetState();
        });

        betInput.addEventListener('input', () => {
          const aposta = parseFloat(betInput.value) || 0;
          apostas[jogo.id] = aposta
          updateButtonBetState();
        });
      });
    });


    function createTeamDiv(teamName, teamLogoSrc) {
      const teamDiv = document.createElement('div');
      teamDiv.classList.add('team-line');

      const teamNameHeading = document.createElement('h2');
      teamNameHeading.textContent = teamName;

      const teamLogo = document.createElement('img');
      teamLogo.classList.add('logo');
      teamLogo.alt = teamName;

      if (teamLogoSrc != null) {
        teamLogo.src = teamLogoSrc;
      } else {
        teamLogo.src = configData.default_logo;
      }

      teamDiv.appendChild(teamNameHeading);
      teamDiv.appendChild(teamLogo);

      return teamDiv;
    }

    function updateButtonBetState() {
      const allBetsAboveZero = apostas.every(aposta => aposta > 0);

      buttonBet.disabled = !allBetsAboveZero;
    }

    buttonBet.addEventListener('click', () => {
      const timesVencedores = configData.Winners
    
      if (configData.RandomWinners) {
        configData.jogos.times.forEach(time => {
          time.active = false;
        })
      }

      const valorTotalApostado = apostas.reduce((total, aposta) => total + aposta, 0);

      const timesSelecionados = configData.jogos.map(jogo => jogo.times.find(time => time.active).time);

      console.log(timesSelecionados);

      const todosTimesApostadosVenceram = timesVencedores.every(time => timesSelecionados.includes(time));

     
      console.log(timesSelecionados.length);
      console.log(apostas.length);
      if (!(timesSelecionados.length + 1 === apostas.length)) {
        alert('Você precisa apostar em todos os times para poder participar um valor superior a 0 !');
      } else if (!timesSelecionados.every(time => time === "") && apostas.map(aposta => aposta > 0)) {
        const winnersTable = document.querySelector('.winners-table');
        winnersTable.style.display = 'flex';

        const winnersTableContent = document.querySelector('.winners-table-content');

        console.log(timesVencedores);
        timesVencedores.forEach((time, index) => {
          const winnerDiv = document.createElement('div');
          winnerDiv.classList.add('winners-table-content-item');

          const winnersTableContentItemPlace = document.createElement('div');
          winnersTableContentItemPlace.classList.add('winners-table-content-item-place');
          winnersTableContentItemPlace.textContent = `${index + 1}º ${timesVencedores[index]}`;

          const winnersTableContentItemTeam = document.createElement('div');
          winnersTableContentItemTeam.classList.add('winners-table-content-item-team');

          const winnerName = document.createElement('span');
          winnerName.classList.add('winner-name');
          winnerName.textContent = time;

          const winnersTableContentItemTeamImage = document.createElement('img');
          winnersTableContentItemTeamImage.src = configData.jogos[index].times.find(time => time.time === timesVencedores[index]).logo || configData.default_logo;
          winnersTableContentItemTeamImage.alt = time;

          winnersTableContentItemTeam.appendChild(winnersTableContentItemTeamImage);

          winnerDiv.appendChild(winnersTableContentItemPlace);
          winnerDiv.appendChild(winnersTableContentItemTeam);

          const winnersTableContentValue = document.querySelector('.winners-table-content-value');
          
          if (todosTimesApostadosVenceram) {
            winnersTableContentValue.style.color = 'green';
            winnersTableContentValue.textContent = `R$ ${valorTotalApostado * configData.multiplier}`;
          } else {
            winnersTableContentValue.style.color = 'red';
            winnersTableContentValue.textContent = `Perdeu R$ ${valorTotalApostado}`;
          }

          winnersTableContent.appendChild(winnerDiv);
        });
      } else {
        alert('Aposte em todos os Times para poder participar!');
      }
    });
  })