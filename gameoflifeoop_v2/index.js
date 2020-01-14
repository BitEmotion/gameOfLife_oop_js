let isDebug;
((isDebug = true) => {
    // CONST string
    const STR_BACKGROUND_CELL_COLOR_PINK = `pink`;
    const STR_BACKGROUND_CELL_COLOR_WHITE = `white`;
    const STR_BACKGROUND_CELL_WIDTH_HEIGHT = `width:10px; height:10px;`;
    const STR_MESSAGE_MUST_BE_OVERRIDEED = `MUST BE OVERRIDEED!`;
    const STR_MESSAGE_TYPE_ERROR_ERROR_PARAM_IS_WRONG_TYPE = `param is wrong type!!`;
    // CONST number
    const NUM_CELL_NUMBER = 50;
    const NUM_NULL_NUMBER = -1;
    // Base API
    const createTag = (tag) => document.createElement(tag);
    const getTagSelector = (tag) => document.querySelector(tag);
    const printError = e => {
        if (isDebug) {
            throw e;
        }
        else {
            console.log(e);
        }
    };
    const injectPropDataToThisClass = (target, ...p) => Object.assign(target, ...p);
    const isInstance = (child, parent) => child instanceof parent;
    // Class
    const CellFactory = class {
        constructor(rowNumber) {
            const cellList = [], tempCellList = [];
            for (let i = 0; i < rowNumber; i++) {
                cellList[i] = [],
                    tempCellList[i] = [];
                for (let j = 0; j < rowNumber; j++) {
                    tempCellList[i][j] = null;
                }
            }
            cellList.forEach(cell => {
                for (let k = 0; k < rowNumber; k++) {
                    const randomBinary = Math.floor((Math.random() * 2));
                    randomBinary == 1
                        ? cell.push(1)
                        : cell.push(0);
                }
            });
            this.m_rowNumber = rowNumber;
            this.m_cellList = cellList;
            this.m_temp_cellList = tempCellList;
        }
    };
    const Renderer = class {
        constructor() {
            this.m_requestId = NUM_NULL_NUMBER;
            this.m_isRequest = false;
        }
        render(data) {
            if (!isInstance(data, CellFactory)) {
                printError(STR_MESSAGE_TYPE_ERROR_ERROR_PARAM_IS_WRONG_TYPE);
                return;
            }
            injectPropDataToThisClass(this, Object.assign({}, data));
            this.m_isRequest = true;
            this._render();
        }
        toggle() {
            if (!this.m_isRequest) {
                this.m_isRequest = !this.m_isRequest;
                this.m_requestId = requestAnimationFrame(this._render.bind(this));
            }
            else {
                this.m_isRequest = !this.m_isRequest;
                cancelAnimationFrame(this.m_requestId);
            }
        }
        _render() {
            printError(STR_MESSAGE_MUST_BE_OVERRIDEED);
        }
        _update() {
            for (let i = 1; i < this.m_rowNumber - 1; i++) {
                for (let j = 1; j < this.m_rowNumber - 1; j++) {
                    let totalCells = 0;
                    totalCells += this.m_cellList[i - 1][j - 1];
                    totalCells += this.m_cellList[i - 1][j];
                    totalCells += this.m_cellList[i - 1][j + 1];
                    totalCells += this.m_cellList[i][j - 1];
                    totalCells += this.m_cellList[i][j + 1];
                    totalCells += this.m_cellList[i + 1][j - 1];
                    totalCells += this.m_cellList[i + 1][j];
                    totalCells += this.m_cellList[i + 1][j + 1];
                    const position = { i, j };
                    if (this.m_cellList[i][j] == 0) {
                        this._applyRuleDeadCell(totalCells, position);
                    }
                    else if (this.m_cellList[i][j] == 1) {
                        this._applyRuleLivingCell(totalCells, position);
                    }
                }
            }
            this._swap();
        }
        _swap() {
            for (let i = 0; i < this.m_rowNumber; i++) {
                for (let j = 0; j < this.m_rowNumber; j++) {
                    this.m_cellList[i][j] = this.m_temp_cellList[i][j];
                }
            }
        }
        _applyRuleDeadCell(totalCells, position) {
            const { i, j } = position;
            switch (totalCells) {
                case 3:
                    this.m_temp_cellList[i][j] = 1;
                    break;
                default:
                    this.m_temp_cellList[i][j] = 0;
            }
        }
        _applyRuleLivingCell(totalCells, position) {
            const { i, j } = position;
            switch (totalCells) {
                case 0:
                case 1:
                    this.m_temp_cellList[i][j] = 0;
                    break;
                case 2:
                case 3:
                    this.m_temp_cellList[i][j] = 1;
                    break;
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    this.m_temp_cellList[i][j] = 0;
                    break;
                default:
                    this.m_temp_cellList[i][j] = 0;
            }
        }
    };
    const TableRenderer = class extends Renderer {
        constructor(dom) {
            super();
            this.m_table = getTagSelector(dom);
            this.m_tableList = [];
            this.m_isTable = false;
        }
        _render() {
            if (this.m_isTable == false) {
                this._tableMaker();
                this.m_isTable = true;
            }
            this._animate();
        }
        _tableMaker() {
            let i = this.m_rowNumber;
            while (i--) {
                const tr = this.m_table.appendChild(createTag('tr'));
                this.m_tableList[i] = [];
                let j = this.m_rowNumber;
                while (j--) {
                    const td = tr.appendChild(createTag('td'));
                    td.style.cssText = STR_BACKGROUND_CELL_WIDTH_HEIGHT;
                    this.m_tableList[i][j] = td;
                }
            }
        }
        _animate() {
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
        _draw() {
            for (let i = 0; i < this.m_rowNumber; i++) {
                for (let j = 0; j < this.m_rowNumber; j++) {
                    const tableStyle = this.m_tableList[i][j].style;
                    if (this.m_cellList[i][j] == 1) {
                        tableStyle.backgroundColor = STR_BACKGROUND_CELL_COLOR_PINK;
                    }
                    else {
                        tableStyle.backgroundColor = STR_BACKGROUND_CELL_COLOR_WHITE;
                    }
                }
            }
        }
    };
    const tableCells = new CellFactory(NUM_CELL_NUMBER);
    const tableRenderer = new TableRenderer('#table');
    tableRenderer.render(tableCells);
    const tableBtn = getTagSelector('#tableBtn');
    tableBtn.addEventListener('click', () => {
        tableRenderer.toggle();
    });
})();
