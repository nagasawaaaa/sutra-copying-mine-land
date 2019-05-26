(function () {
  let W = 10;
  let H = 10;
  let BOMB = 15;
  let cell = [];
  let opened = 0;

  function init() {
    const main = document.getElementById('main');

    for (let i = 0; i < H; i++) {
      cell[i] = []; // [ [], [], [], ...[] ]
      let tr = document.createElement('tr');
      for (let j = 0; j < W; j++) {
        let td = document.createElement('td');
        td.addEventListener('click', click);
        td.className = 'cell';
        td.y = i;
        td.x = j;
        cell[i][j] = td;
        tr.appendChild(td);
      }
      main.appendChild(tr);
    }

    for (let i = 0; i < BOMB; i++) {
      while (true) {
        let x = Math.floor(Math.random() * W);
        let y = Math.floor(Math.random() * H);
        if (!cell[x][y].bomb) {
          cell[x][y].bomb = true;
          // cell[x][y].textContent = '*';
          break;
        }
      }
    }
  }

  function count(x, y) {
    let b = 0;
    for (let j = y - 1; j <= y + 1; j++) {
      for (let i = x - 1; i <= x + 1; i++) {
        if (cell[j] && cell[j][i]) {
          if (cell[j][i].bomb) b++;
        }
      }
    }
    return b;
  }

  function open(x, y) {
    for (let j = y - 1; j <= y + 1; j++) {
      for (let i = x - 1; i <= x + 1; i++) {
        if(cell[j] && cell[j][i]) {
          let c = cell[j][i];
          if (c.opened || c.bomb) {
            continue;
          }
          flip(c);
          let n = count(i ,j);
          if (n === 0) {
            open(i, j);
          } else {
            c.textContent = n;
          }
        }
      }
    }
  }

  function flip(cell) {
    cell.className = 'cell open';
    cell.opened = true;
    if (++opened >= (W * H - BOMB)) {
      document.getElementById('title').textContent = 'Good Job!';
    }
  }

  function click(e) {
    let src = e.currentTarget;
    if (src.bomb) {
      cell.forEach(function (tr) {
        tr.forEach(function (td) {
          if (td.bomb) {
            td.textContent = '+';
          }
        });
      });
      document.getElementById('title').textContent = 'Game Over';
    } else {
      open(src.x, src.y);
    }
  }

  window.addEventListener('load', init);

}());

