(_=> {
	const createTag = tag => document.createElement(tag);
	const getTagById = tag => document.getElementById(tag);
	const printError = e => {
		if(isDebug) {
			throw e
		} else {
			console.log(e);
		}
	};
	const makePropData = (target, ...p) => Object.assign(target, ...p);
	const isInstance = (child, parent) => child instanceof parent;

	const Data = class {
		static setting(arg){
			const {rows:r, cells:c, temps:t} = arg;
			if(typeof r != 'number') {
				printError('rows not number!');
			}
			if(!Array.isArray(c)) {
				printError('cells not Array!');
			}
			if(!Array.isArray(t)) {
				printError('temps not Array!');
			}
			return new Data(arg);
		}
		constructor(...arg){
			makePropData(this, ...arg);
		}
	}
	
	const CellFactory = class {
		static create(rows){
			const cells = [], temps = [];
			for(let i = 0; i < rows; i++) {
				cells[i] = [] , temps[i] = [];
				for(let j = 0; j < rows; j++) {
					temps[i][j] = null;
				}
			}
			cells.forEach(j => {
				for(let k = 0; k < rows; k++){
					const randomBinary = Math.floor((Math.random() * 2));
					randomBinary == 1 ? j.push(1) : j.push(0); 
				}
			});
			return Data.setting(new CellFactory(rows, cells, temps));
		}
		constructor(rows, cells, temps){
			this.rows = rows;
			this.cells = cells;
			this.temps = temps;
		}
	}

	const Renderer = class {
		constructor(){
			this.requestId = null;
			this.isRequest = false;
		}
		render(data){
			if(!isInstance(data, Data)) printError('render`s param is not Data!!');
			makePropData(this, {...data});
			this.isRequest = true;
			this._render();
		}
		toggle(){
			this._toggle();
		}
		_toggle(){
			console.log('toggle');
			if(!this.isRequest){
				this.isRequest = !this.isRequest;
				this.requestId = requestAnimationFrame(this._render.bind(this));
			} else {
				this.isRequest = !this.isRequest;
				cancelAnimationFrame(this.requestId);
			}
		}
		_render(){
			printError('MUST BE OVERRIDEED!');
		}
		_update(){
			for(let i = 1; i < this.rows - 1; i++){
				for(let j = 1; j < this.rows - 1; j++) {
					let totalCells = 0;
					const index = {i:i,j:j};
					totalCells += this.cells[i - 1][j - 1];
					totalCells += this.cells[i - 1][j];
					totalCells += this.cells[i - 1][j + 1];
					totalCells += this.cells[i][j - 1];
					totalCells += this.cells[i][j + 1]; 
					totalCells += this.cells[i + 1][j - 1];
					totalCells += this.cells[i + 1][j];
					totalCells += this.cells[i + 1][j + 1];
					if(this.cells[i][j] == 0){
						this._applyRuleDeadCell(totalCells, index);
					} else if( this.cells[i][j] == 1){
						this._applyRuleLivingCell(totalCells, index);
					}
				}
			}
			this._swap();		
		}
		_swap(){
			for(let i = 0; i < this.rows; i++){
				for(let j = 0; j < this.rows; j++){
					this.cells[i][j] = this.temps[i][j];
				}
			}	
		}
		_applyRuleDeadCell(totalCells, index){
			const {i, j} = index;
			switch(totalCells){
				case 3:
					this.temps[i][j] = 1;
					break;
				default:
					this.temps[i][j] = 0;
			}
		}
		_applyRuleLivingCell(totalCells, index){
			const {i, j} = index;
			switch(totalCells){
				case 0: case 1:
					this.temps[i][j] = 0;
					break;
				case 2: case 3:
					this.temps[i][j] = 1;
					break;
				case 4: case 5: case 6: case 7: case 8:
					this.temps[i][j] = 0;
					break;
				default:
					this.temps[i][j] = 0;
			}
		}
	}

	const CanvasRenderer = class extends Renderer {
		constructor(dom){
			super();
			this.canvas = getTagById(dom);
			this.context = this.canvas.getContext('2d');
		}
		_render(){
			this._update();
			this._draw();
			this.requestId = requestAnimationFrame(this._render.bind(this));
		}
		_draw(){
			this.context.clearRect(0, 0, this.rows, this.rows);
			for(let i = 1; i < this.rows; i++){
				for(let j = 1; j < this.rows; j++){
					if(this.cells[i][j] == 1){
						this.context.fillStyle = 'pink';
						this.context.fillRect(i, j, 1, 1);
					}
				}
			}
		}
	}

	const TableRenderer = class extends Renderer {
		constructor(dom){
			super();
			this.table = getTagById(dom);
			this.tableArray = [];
			this.tableCount = 0;
		}
		_animate(){
			this._update();
			this._draw();
			this.requestId = requestAnimationFrame(this._animate.bind(this));
		}
		_render(){
			if(this.tableCount == 0){
				this._tableMaker();
				this.tableCount++;
			} 
			this._animate();
		}
		_tableMaker(){
			let i = this.rows;
			while(i--){
				const tr = this.table.appendChild(createTag('tr'));
				this.tableArray[i] = [];
				let j = this.rows;
				while(j--){
					const td = tr.appendChild(createTag('td'));
					td.style.cssText = `width:10px; height:10px;`;
					this.tableArray[i][j] = td;				
				}
			}			
		}
		_draw(){
			for(let i = 0; i < this.rows; i++){
				for(let j = 0; j < this.rows; j++){
					const ts = this.tableArray[i][j].style;
					if(this.cells[i][j] == 1){
						ts.backgroundColor = `pink`;
					} else {
						ts.backgroundColor = `white`;
					}
				}
			}
		}
	}
	const ConsoleRenderer = class extends Renderer {
		constructor(){
			super();
		}
		_render(){
			this._update();
			this._draw();
			this.requestId = requestAnimationFrame(this._render.bind(this));
		}
		_draw(){
			for(let i = 0; i < this.rows; i++){
				for(let j = 0; j < this.rows; j++){
					console.log(this.cells);
				}
			}
		}
	}

	const canvasCells = CellFactory.create(400);
	const tableCells = CellFactory.create(50);
	const consoleCells = CellFactory.create(5);

	const canvasRenderer = new CanvasRenderer('canvas');
	canvasRenderer.render(canvasCells);

	const tableRenderer = new TableRenderer('table');
	tableRenderer.render(tableCells);

	const consoleRenderer = new ConsoleRenderer();
	consoleRenderer.render(consoleCells);

	const canvasBtn = getTagById('canvasBtn');
	canvasBtn.addEventListener('click', _ =>{
		canvasRenderer.toggle();
	});
	const tableBtn = getTagById('tableBtn');
	tableBtn.addEventListener('click', _ =>{
		tableRenderer.toggle();
	});
	const consoleBtn = getTagById('consoleBtn');
	consoleBtn.addEventListener('click', _ =>{
		consoleRenderer.toggle();
	});
	
})(isDebug = true);