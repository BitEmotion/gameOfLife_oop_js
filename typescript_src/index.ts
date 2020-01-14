let isDebug;
((isDebug = true) => {
	//Interface
	interface ICellFactory {
		m_rowNumber: number;
        m_cellList:Array<Array<number>>;
		m_temp_cellList:Array<Array<number | null>>;
	}
	interface IRenderer {
		m_requestId: number;
		m_isRequest: boolean;
		m_rowNumber: number;
		m_cellList: Array<Array<number>>;
		m_temp_cellList: Array<Array<number | null>>;
	}
	interface ITableRenderer {
		toggle();
		render(tableCells: ICellFactory);
		m_table: Element;
		m_tableList: Array<Array<HTMLElement>>;
		m_isTable: boolean;
	}
	// CONST string
	const STR_BACKGROUND_CELL_COLOR_PINK: string = `pink`;
	const STR_BACKGROUND_CELL_COLOR_WHITE: string = `white`;
	const STR_BACKGROUND_CELL_WIDTH_HEIGHT: string = `width:10px; height:10px;`;
	const STR_MESSAGE_MUST_BE_OVERRIDEED: string = `MUST BE OVERRIDEED!`;
	const STR_MESSAGE_TYPE_ERROR_ERROR_PARAM_IS_WRONG_TYPE: string = `param is wrong type!!`;
	
	// CONST number
	const NUM_CELL_NUMBER: number = 50;
	const NUM_NULL_NUMBER: number = -1;

	// Base API
    const createTag = (tag: string) => document.createElement(tag);
	const getTagSelector = (tag: string) => document.querySelector(tag);
	const printError = e => {
		if(isDebug) {
			throw e;
		} else {
			console.log(e);
		}
    };
    const injectPropDataToThisClass = (target, ...p) => Object.assign(target, ...p);
    const isInstance = (child, parent) => child instanceof parent;

	// Class
    const CellFactory = class {
		// CellFactory는 Cell data를 생성한다.
		// 생성된 인스턴스는 랜더러에 주입되는 전략 객체의 성격을 지닌다.
        public m_rowNumber: number;
        public m_cellList:Array<Array<number>>;
		public m_temp_cellList:Array<Array<number | null>>;
		
		constructor(rowNumber){
			const cellList: Array<Array<number>> = [], 
				  tempCellList: Array<Array<number | null>> = [];

			for(let i = 0; i < rowNumber; i++) {
				cellList[i] = [], 
				tempCellList[i] = [];
				for(let j = 0; j < rowNumber; j++) {
					tempCellList[i][j] = null;
				}
			}
			cellList.forEach(cell => {
				for(let k = 0; k < rowNumber; k++){
					const randomBinary: number = Math.floor((Math.random() * 2));
					randomBinary == 1 
						? cell.push(1) 
						: cell.push(0); 
				}
			});

			this.m_rowNumber = rowNumber;
			this.m_cellList = cellList;
			this.m_temp_cellList = tempCellList;
		}
	}
	
	const Renderer = class {
		// 부모 클래스인 Renderer는 랜더러에 필요한 데이터를 공급할 뿐
		// 구체적인 행동은 자식 클래스인 TableRenderer가 정한다

		// 기본 property
		m_requestId: number;
		m_isRequest: boolean;
		// 외부에서 주입되는 property 
		m_rowNumber: number;
		m_cellList: Array<Array<number>>;
		m_temp_cellList: Array<Array<number | null>>;

		constructor(){
			this.m_requestId = NUM_NULL_NUMBER;
			this.m_isRequest = false;
		}

		public render(data: ICellFactory): void {
			if(!isInstance(data, CellFactory)){
				printError(STR_MESSAGE_TYPE_ERROR_ERROR_PARAM_IS_WRONG_TYPE);
				return;
			}
			injectPropDataToThisClass(this, {...data});
			this.m_isRequest = true;
			this._render();
		}

		public toggle(): void {
			if(!this.m_isRequest){
				this.m_isRequest = !this.m_isRequest;
				this.m_requestId = requestAnimationFrame(this._render.bind(this));
			} else {
				this.m_isRequest = !this.m_isRequest;
				cancelAnimationFrame(this.m_requestId);
			}
		}
		protected _render() {
			printError(STR_MESSAGE_MUST_BE_OVERRIDEED);
		}
		protected _update() {
			for(let i = 1; i < this.m_rowNumber - 1; i++){
				for(let j = 1; j < this.m_rowNumber - 1; j++) {
					let totalCells: number = 0;
					totalCells += this.m_cellList[i - 1][j - 1];
					totalCells += this.m_cellList[i - 1][j];
					totalCells += this.m_cellList[i - 1][j + 1];
					totalCells += this.m_cellList[i][j - 1];
					totalCells += this.m_cellList[i][j + 1]; 
					totalCells += this.m_cellList[i + 1][j - 1];
					totalCells += this.m_cellList[i + 1][j];
					totalCells += this.m_cellList[i + 1][j + 1];
					const position: {i:number,j:number} = {i,j};
					if(this.m_cellList[i][j] == 0){
						this._applyRuleDeadCell(totalCells, position);
					} else if(this.m_cellList[i][j] == 1){
						this._applyRuleLivingCell(totalCells, position);
					}
				}
			}
			this._swap();		
		}
		private _swap(){
			for(let i = 0; i < this.m_rowNumber; i++){
				for(let j = 0; j < this.m_rowNumber; j++){
					this.m_cellList[i][j] = this.m_temp_cellList[i][j];
				}
			}
		}
		private _applyRuleDeadCell(totalCells, position){
			const {i, j} = position;
			switch(totalCells){
				case 3:
					this.m_temp_cellList[i][j] = 1;
					break;
				default:
					this.m_temp_cellList[i][j] = 0;
			}
		}
		private _applyRuleLivingCell(totalCells, position){
			const {i, j} = position;
			switch(totalCells){
				case 0: case 1:
					this.m_temp_cellList[i][j] = 0;
					break;
				case 2: case 3:
					this.m_temp_cellList[i][j] = 1;
					break;
				case 4: case 5: case 6: case 7: case 8:
					this.m_temp_cellList[i][j] = 0;
					break;
				default:
					this.m_temp_cellList[i][j] = 0;
			}
		}
	}
	
	const TableRenderer = class extends Renderer {
		m_table: Element;
		m_tableList: Array<Array<HTMLElement>>;
		m_isTable: boolean;

		constructor(dom){
			super();
			this.m_table = getTagSelector(dom);
			this.m_tableList = [];
			this.m_isTable = false;
		}
		protected _render() {
			if(this.m_isTable == false){
				this._tableMaker();
				this.m_isTable = true;
			}
			this._animate();
		}
		private _tableMaker(){
			let i = this.m_rowNumber;
			while(i--){
				const tr: HTMLElement = this.m_table.appendChild(createTag('tr'));
				this.m_tableList[i] = [];
				let j = this.m_rowNumber;
				while(j--){
					const td: HTMLElement = tr.appendChild(createTag('td'));
					td.style.cssText = STR_BACKGROUND_CELL_WIDTH_HEIGHT;
					this.m_tableList[i][j] = td;	
				}
			}
		}
		private _animate() {
			// es6에서
			// super는 현재 시점보다 부모 클래스를
			// this는 현재 시점 클래스를 참조한다.
			//   -> (es5와 하위 호환성 때문에 부모 클래스도 참조할 수 있다)

			// es5의 문제는 this가 부모 자식 상관없이 참조할 수 있다는 점이다.
			// 개발자는 this를 볼 때 부모 매소드인지 자식 메소드인지 헷갈린다.
			// 그래서 super키워드가 도입되었다.
			super._update();

			this._draw();
			this.m_requestId = requestAnimationFrame(this._animate.bind(this));
		}
		private _draw() {
			for(let i = 0; i < this.m_rowNumber; i++){
				for(let j = 0; j < this.m_rowNumber; j++){
					const tableStyle: CSSStyleDeclaration = this.m_tableList[i][j].style;
					if(this.m_cellList[i][j] == 1){
						tableStyle.backgroundColor = STR_BACKGROUND_CELL_COLOR_PINK;
					} else {
						tableStyle.backgroundColor = STR_BACKGROUND_CELL_COLOR_WHITE;
					}
				}
			}
		}
	}

	const tableCells: ICellFactory = new CellFactory(NUM_CELL_NUMBER);
	const tableRenderer: ITableRenderer = new TableRenderer('#table');
	tableRenderer.render(tableCells);

	const tableBtn: Element = getTagSelector('#tableBtn');
	tableBtn.addEventListener('click', () =>{
		tableRenderer.toggle();
	});
})();