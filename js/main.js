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

      const resultadoFiltrado = apostas.map(aposta => aposta >= 1).filter(Boolean);
      const tamanhoDoArrayFiltrado = resultadoFiltrado.length;
      
      console.log(timesSelecionados.length + 1);

      if (!(timesSelecionados.length === tamanhoDoArrayFiltrado)) {
        alert('Você precisa apostar em todos os times para poder participar um valor superior a 0 !');
      } else if (!timesSelecionados.every(time => time === "") && apostas.map(aposta => aposta > 0)) {
        const winnersTable = document.querySelector('.winners-table');
        winnersTable.style.display = 'flex';

        const deleteButtonBet = document.querySelector('.button-bet');
        deleteButtonBet.style.display = 'none';

        const winnersTableContent = document.querySelector('.winner-table');
        const loseTableContent = document.querySelector('.lose-table');

        console.log(timesVencedores);
        timesVencedores.forEach((time, index) => {
          // winnersTableContentWinners adicione apenas os times que ganharam
          const winnersTableContentItemTeam = document.createElement('div');
          winnersTableContentItemTeam.classList.add('game');

          const winnerName = document.createElement('span');
          winnerName.classList.add('winner-name');
          winnerName.textContent = time;

          const winnersTableContentItemTeamImage = document.createElement('img');
          winnersTableContentItemTeamImage.src = configData.jogos[index].times.find(time => time.time === timesVencedores[index]).logo || configData.default_logo;
          winnersTableContentItemTeamImage.alt = time;

          winnersTableContentItemTeam.appendChild(winnersTableContentItemTeamImage);
          winnersTableContentItemTeam.appendChild(winnerName);

          ////////////////////////////////////////////////////////////////////////////
          const loseTableContentItemTeam = document.createElement('div');
          loseTableContentItemTeam.classList.add('game');

          const loseName = document.createElement('div');
          loseName.classList.add('game-name');
          loseName.textContent = timesSelecionados[index];

          const loseTableContentItemTeamImage = document.createElement('img');
          loseTableContentItemTeamImage.src = configData.jogos[index].times.find(time => time.time === timesSelecionados[index]).logo || configData.default_logo;
          loseTableContentItemTeamImage.alt = timesSelecionados[index];

          loseTableContentItemTeam.appendChild(loseTableContentItemTeamImage);
          loseTableContentItemTeam.appendChild(loseName);

          ////////////////////////////////////////////////////////////////////////////

          const winnersTableFooterContentLeftTitle = document.querySelector('.preview');
          winnersTableFooterContentLeftTitle.style.color = 'green';
          winnersTableFooterContentLeftTitle.textContent = `R$ ${valorTotalApostado * configData.multiplier}`;
          
          const winnersTableFooterContentRightTitle = document.querySelector('.previewTitle');
          const winnersTableFooterContentRightValue = document.querySelector('.previewValue');

          if (todosTimesApostadosVenceram) {
            winnersTableFooterContentRightValue.style.color = 'green';
            winnersTableFooterContentRightTitle.textContent = 'Quanto Ganhou';
            winnersTableFooterContentRightValue.textContent = `R$ ${valorTotalApostado * configData.multiplier}`;
          } else {
            winnersTableFooterContentRightValue.style.color = 'red';
            winnersTableFooterContentRightTitle.textContent = 'Quanto Perdeu';
            winnersTableFooterContentRightValue.textContent = `R$ ${valorTotalApostado}`;
          }

          winnersTableContent.appendChild(winnersTableContentItemTeam);
          loseTableContent.appendChild(loseTableContentItemTeam);
        });
      } else {
        alert('Aposte em todos os Times para poder participar!');
      }
    });
  })