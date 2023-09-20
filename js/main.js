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

    configData.jogos.forEach(jogo => {
      const homeTeamDiv = createTeamDiv(jogo.time, jogo.logo);
      const awayTeamDiv = createTeamDiv(jogo.adversario, jogo.logo);
      const versusSpan = document.createElement('span');

      versusSpan.classList.add('span-gray');
      versusSpan.textContent = "vs";

      const betInput = document.createElement('input');
      betInput.classList.add('bet-quantity');
      betInput.type = 'number';
      betInput.name = 'bet-quantity';
      betInput.placeholder = '0';

      betInput.dataset.valorAposta = jogo.valor_aposta;

      const gameDiv = document.createElement('div');
      gameDiv.classList.add('team');

      gameDiv.appendChild(homeTeamDiv);
      gameDiv.appendChild(versusSpan);
      gameDiv.appendChild(awayTeamDiv);

      if (jogo.active) {
        homeTeamDiv.classList.add('active');
        gameDiv.appendChild(betInput);
      }

      valorantTeams.appendChild(gameDiv);

      homeTeamDiv.addEventListener('click', () => {
        jogo.active = !jogo.active;
        homeTeamDiv.classList.add('active');
        awayTeamDiv.classList.remove('active');

        if (jogo.active) gameDiv.appendChild(betInput);

        updateButtonBetState();
      });

      awayTeamDiv.addEventListener('click', () => {
        jogo.active = !jogo.active;
        awayTeamDiv.classList.add('active');
        homeTeamDiv.classList.remove('active');

        if (jogo.active) gameDiv.appendChild(betInput)

        updateButtonBetState();
      });

      betInput.addEventListener('input', () => {
        const aposta = parseFloat(betInput.value) || 0;
        apostas[jogo.id] = aposta
        updateButtonBetState();
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
        configData.jogos.forEach(jogo => {
          const aposta = apostas[jogo.id];
      

          const vencedor = aposta > 0 && Math.random() > 0.5 ? jogo.time : jogo.adversario;
          console.log(vencedor);
          timesVencedores.push(vencedor);
        });
      }

      const valorTotalApostado = apostas.reduce((total, aposta) => total + aposta, 0);
    
      const timesApostados = configData.jogos.map(jogo => jogo.active ? jogo.time : "");
  
      const todosTimesApostadosVenceram = timesApostados.every(time => timesVencedores.includes(time));

      if (todosTimesApostadosVenceram) {
        const winnersTable = document.querySelector('.winners-table');
        winnersTable.style.display = 'flex';

        const winnersTableContent = document.querySelector('.winners-table-content');
        timesVencedores.forEach((time, index) => {
          const winnersTableContentItem = document.createElement('div');
          winnersTableContentItem.classList.add('winners-table-content-item');

          const winnersTableContentItemPlace = document.createElement('div');
          winnersTableContentItemPlace.classList.add('winners-table-content-item-place');
          winnersTableContentItemPlace.textContent = `${index + 1}º`;

          const winnersTableContentItemTeam = document.createElement('div');
          winnersTableContentItemTeam.classList.add('winners-table-content-item-team');

          const winnersTableContentItemTeamImage = document.createElement('img');
          winnersTableContentItemTeamImage.src = configData.jogos.find(jogo => jogo.time === time).logo ?? configData.default_logo;
          winnersTableContentItemTeamImage.alt = time;

          winnersTableContentItemTeam.appendChild(winnersTableContentItemTeamImage);

          winnersTableContentItem.appendChild(winnersTableContentItemPlace);
          winnersTableContentItem.appendChild(winnersTableContentItemTeam);
          const winnersTableContentValue = document.querySelector('.winners-table-content-value');
          winnersTableContentValue.textContent = `R$ ${valorTotalApostado}`;

          winnersTableContent.appendChild(winnersTableContentItem);
        });
      }
    });
  })
  .catch(error => {
    console.error('Erro:', error);
  });