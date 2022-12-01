//定义邻点ooooo
const neighbor =[
    [-1,-1] , [-1, 0] , [-1, 1],
    [ 0,-1] ,           [ 0, 1] ,
    [ 1,-1] , [ 1, 0] , [ 1, 1]
];


//定义游戏状态
let game = {
    m : 10,
    n : 10,
    cells : null,
    isOver : false,
    isPass : false ,
    second : 0 ,
    flagCount : 0,
    timerId : 0 ,
    
};


//该点位周围雷数
function countNeiborbomb(game){


    for (let i = 0;i < game.m ;i++){
        for (let j = 0;j < game.n;j++){
            if (game.cells[i][j].value === -1){
                continue;
            }

            let numBombs = 0;
            for (let k = 0;k < 8; k++){
                let offset = neighbor[k];
                let newRowIdx = i + offset[0];
                let newColIdx = j + offset[1];
                if (newRowIdx < 0 || newRowIdx >= game.m || newColIdx < 0 || newColIdx >= game.n){
                    continue;
                }
                if (game.cells[newRowIdx][newColIdx].value === -1){
                    numBombs += 1;

                }
            }
            game.cells[i][j].value = numBombs;
        }
    } 
}



//随机雷
function init(m,n){
    var arr = new Array(m*n);
    for(var i =0;i<arr.length;i++){
        arr[i] = i;
    }
    arr.sort(() => 0.5-Math.random());
    let u = Math.trunc( m*n*0.15 ) ;
    return arr.slice(0,u);

    
}


//初始化棋盘
function initialize(game){
    let cells = new Array(game.m);
        //对空棋盘标号
    for (let i = 0;i < game.m ;i++){
        cols = new Array(game.classNamen);
        for (let j =0;j < game.n;j++){
            cols[j] = {value: 0,clear: false,flag: false};
        }
        
    cells[i]= cols;
    }

    let numOfCells = game.m * game.n;
    
        //填雷,有雷的地方为-1
    for (let index of init(game.m,game.n) ){
        let i = Math.trunc(index / game.n);
        let j = index % game.n;
        cells[i][j].value = -1;

    }




    game.cells = cells;
}



function spread(cells,rowIdx,colIdx,m,n) {
    let cell = cells[rowIdx][colIdx];
    if (cell.clear){
        return ;
    }

    cell.clear = true ;
    cell.element.classList.add('clear');

    if (cell.value === 0){
        for (let k = 0;k < 8; k++){
            let offset = neighbor[k];
            let newRowIdx = rowIdx + offset[0];
            let newColIdx = colIdx + offset[1];
            if (newRowIdx < 0 || newRowIdx >= game.m || newColIdx < 0 || newColIdx >= game.n){
                continue;
            }

            let nextCell = cells[newRowIdx][newColIdx];
            if (nextCell.value > 0){
                nextCell.clear = true;
                nextCell.element.classList.add('clear');
            } else if (nextCell.value === 0){
                spread(cells,newRowIdx,newColIdx, m, n);
            }
            
        }
    }
}


//结束机制(踩到炸弹)
function over(game , rowIdx , colIdx){
    game.isOver = true;
    let cell =  game.cells[rowIdx][colIdx];
    cell.element.classList.add('touched');
    //cell.element.classList.add('bomb');
    cell.element.classList.add('exploded');
    for (let i = 0;i < game.m;i++){
        for (let j =0 ; j < game.n;j++){
            let cell = game.cells[i][j];

            
            let value = game.cells[i][j].value;
            if ( value === -1){
                //cellEl.innerHTML = '&#128163;' ;
                cell.element.classList.add('bomb');
            }
            
            if (!cell.clear){
             //   cell.element.classList.add('clear');
                
                cell.element.classList.add('exploded');
                cell.clear = true;
            }
        }
    
    }

    let statusEl = document.querySelector('#game > .result'); 
    statusEl.innerHTML = 'Failed';
    gameFinished(game);
}

//结束机制（通过）
function pass(game){
    let unflagged = 0;
    for (let i = 0;i < game.m;i++){
        
        for (let j =0 ; j < game.n;j++){
            let cell = game.cells[i][j];
            
            if (cell.value === -1){
                if (!cell.flag ){
                    unflagged += 1;

                }

            }

        
        }
    }
    
    if (unflagged === 0){
        game.isPass = true;
        for (let i = 0;i < game.m;i++){
        
            for (let j =0 ; j < game.n;j++){
                let cell = game.cells[i][j];
                if (cell.value === -1){
                    cell.element.classList.add('bomb');
                    cell.element.classList.add('pass');

                }
            }

        }
        gameFinished(game);

        let statusEl = document.querySelector('#game > .result'); 
        statusEl.innerHTML = 'Passed';
    }

    
}



//计时器停止
function gameFinished(game){
    clearInterval(game.timerId);
}


//计时器
function start_timer(game){
    let timeEl = document.querySelector('#game > .info-panel> .timer');
    game.timerId = setInterval(()=> {
        game.second += 0.01;
        timeEl.innerHTML = `${game.second.toFixed(2)}`;

    }, 10);
 
}





//炸弹计数器
function countBombs(game){
    let bombEl = document.querySelector('#game > .info-panel> .bombCounter');
    bombEl.innerHTML = `${ Math.trunc( game.m*game.n*0.15 )}`;
    

}

//旗帜计数器
function countFlags(game , delta){
    game.flagCount += delta;

    let flagEl = document.querySelector('#game > .info-panel> .flagCounter');

    flagEl.innerHTML = `${game.flagCount}`;

}



//棋盘及操作
function render_grid(game){
 

    let tableEl = document.querySelector('#game table.game-grid');

    for (let i = 0;i < game.m;i++){
        let trEl=document.createElement('tr');
        for (let j =0 ; j < game.n;j++){
            
            let cellEl = document.createElement('div');
            cellEl.className = 'cell';

            game.cells[i][j].element = cellEl;

            let value = game.cells[i][j].value;

            //if ( value === -1){
                //cellEl.innerHTML = '&#128163;' ;
                //cellEl.classList.add('bomb');
            //}else 
            if (value > 0){
                cellEl.innerHTML = ` <span> ${value} </span> ` ; 
            }

                 //鼠标左键操作
            cellEl.addEventListener('click', (e)=> {

                e.stopPropagation();
                e.preventDefault();
                if (game.timerId === 0){
                    start_timer(game);
                }
                if (game.isOver||game.isPass){
                    return;
                }
                if (game.cells.clear){
                    return;
                }
                let cell = game.cells[i][j];
                if (cell.flag){
                    cell.flag = false;
                    cellEl.classList.remove('flag');

                    countFlags(game,-1);
                } else {
                    if (cell.value === -1){
                        over(game, i, j);

                    } else{
                        spread(game.cells,i,j,game.m,game.n);
                            cellEl.classList.add('clear');
                            //cells[i][j].clear = true; 
                    }

                        
                                   
                }

                
            })
            
            
                //鼠标右键操作
            cellEl.addEventListener('contextmenu', (e)=> {
               
                e.stopPropagation();
                e.preventDefault();
                if (game.timerId === 0){
                    start_timer(game);
                }
                if (game.isOver ||game.isPass){
                    return;
                }

                


                if (game.cells.flag ){
                    return;
                }
                let cell = game.cells[i][j];        
                if (cell.flag){
                    cell.flag = false;
                    cellEl.classList.remove('flag');
                    countFlags(game,-1);
                } else {
                    cellEl.classList.add('flag');
                    game.cells[i][j].flag = true;
                    countFlags(game, 1);

                }
                pass(game);
            })    
                
                   


            let tdEl = document.createElement('td');
            tdEl.append(cellEl);
            trEl.append(tdEl);
            
        }
        tableEl.append(trEl);
    }
}


//游戏初始化
function render_game(game){
    initialize(game);
    countNeiborbomb(game);
    
    render_grid(game);
    countFlags(game, 0);
   
    countBombs(game);


}


document.body.onload = function(){
    render_game(game);
}