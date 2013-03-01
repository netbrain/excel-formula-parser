var Parser = (function() {

	var type = {
		NUM: 0,
		STR: 1,
		PERCENT: 2,
		SUB: 3,
		ADD: 4,
		DIV: 5,
		MUL: 6,
		POW: 7,
		CONCAT: 8,
		LT: 9,
		LE: 10,
		EQ: 11,
		GE: 12,
		GT: 13,
		NE: 14,
		ISECT: 15,
		LIST: 16,
		RANGE: 17,
		REF: 18,
		FUNC: 19,
		BOOL: 22,
		PAR:25,
		ARR:26,
	};

	function Lex(input) {
		var lexer = this;
		this.token = function(type, val) {
			return {
				type: type,
				val: val
			};
		};

		this.emit = function(type) {
			var rawValue = this.input.substring(this.start, this.pos);
			this.newStart();
			this.tokens.push(this.token(type, rawValue));
		};

		this.lex = {
			str: function() {
				if(lexer.isNextConsume('"')) {
					if(lexer.ignoreUntil('"')) {
						lexer.emit(type.STR);
					} else {
						throw "Error occured parsing string!"
					}
				}
			},
			bool:function(){
				if(lexer.isNextConsume('TRUE') || lexer.isNextConsume('FALSE')) {
					lexer.emit(type.BOOL);
				}
			},
			ne: function() {
				if(lexer.isNextConsume('<>')) {
					lexer.emit(type.NE);
				}
			},
			ge: function() {
				if(lexer.isNextConsume('>=')) {
					lexer.emit(type.GE);
				}
			},
			le: function() {
				if(lexer.isNextConsume('<=')) {
					lexer.emit(type.LE);
				}
			},
			missarg: function() {
				if(lexer.isNext(',,')) {
					lexer.next();
					lexer.emit(type.LIST);
					lexer.next();
					lexer.emit(type.LIST);
				}
			},
			percent: function() {
				if(lexer.isNextConsume('%')) {
					lexer.emit(type.PERCENT);
				}
			},
			mul: function() {
				if(lexer.isNextConsume('*')) {
					lexer.emit(type.MUL);
				}
			},
			div: function() {
				if(lexer.isNextConsume('/')) {
					lexer.emit(type.DIV);
				}
			},
			sub: function() {
				if(lexer.isNextConsume('-')) {
					lexer.emit(type.SUB);
				}
			},
			add: function() {
				if(lexer.isNextConsume('+')) {
					lexer.emit(type.ADD);
				}
			},
			pow: function() {
				if(lexer.isNextConsume('^')) {
					lexer.emit(type.POW);
				}
			},
			concat: function() {
				if(lexer.isNextConsume('&')) {
					lexer.emit(type.CONCAT);
				}
			},
			lt: function() {
				if(lexer.isNextConsume('<')) {
					lexer.emit(type.LT);
				}
			},
			eq: function() {
				if(lexer.isNextConsume('=')) {
					lexer.emit(type.EQ);
				}
			},
			gt: function() {
				if(lexer.isNextConsume('>')) {
					lexer.emit(type.GT);
				}
			},
			isect: function() {
				if(lexer.isNextConsume(' ')) {
					lexer.emit(type.ISECT);
				}
			},
			list: function() {
				if(lexer.isNextConsume(',')) {
					lexer.emit(type.LIST);
				}
			},
			range: function() {
				if(lexer.isNextConsume(':')) {
					lexer.emit(type.RANGE);
				}
			},
			par: function() {
				if(lexer.isNextPar()) {
					lexer.emit(type.PAR);
				}
			},
			arr: function() {
				if(lexer.isNextArr()) {
					lexer.emit(type.ARR);
				}
			},			
			func: function() {
				if(lexer.isNextFunc()) {
					lexer.emit(type.FUNC);
				}
			},
			num: function() {
				if(!isNaN(lexer.peek())) {
					lexer.accept("0123456789");
					lexer.accept(".0123456789");
					lexer.emit(type.NUM);
				}
			},
			ref: function() {
				if(lexer.accept("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
					lexer.emit(type.REF);
				}
			},
		};

		this.next = function() {
			var n = this.input[this.pos];
			this.pos++
			return n;
		};

		this.backup = function() {
			this.pos--;
		};

		this.peek = function() {
			var n = this.next();
			this.backup();
			return n;
		};

		this.isNext = function(str) {
			return this.input.indexOf(str, this.pos) === this.pos;
		};

		this.isNextConsume = function(str) {
			if(this.isNext(str)) {
				this.pos += str.length;
				return true;
			}
			return false;
		};

		this.isNextFunc = function() {
			var pos = this.pos;
			if(this.accept("ABCDEFGHIJKLMNOPQRSTUVWXYZ") && this.isNextPar()) {
				return true;
			}
			this.pos = pos;
			return false;
		};

		this.isNextPar = function(){
			return this._isNextGroup('(',')');
		};

		this.isNextArr = function(){
			return this._isNextGroup('{','}');
		};

		//helper function to stay dry
		this._isNextGroup = function(startChar,endChar){
			if(lexer.isNextConsume(startChar)) {
				var b = 1;
				while(!lexer.isAtEndOfLine()){
					var n = lexer.next();					
					if(n === startChar){
						b++;
					}else if(n === endChar){
						b--;
					}

					if(b === 0) break;
				}
			}
			return b === 0;
		}

		this.accept = function(str) {
			var accepted = false;
			var n = this.next();
			while(str.indexOf(n) !== -1) {
				accepted = true;
				n = this.next();
			}
			this.backup();
			return accepted;
		};

		this.ignore = function(i) {
			this.pos += i;
		};

		this.ignoreUntil = function(str) {
			var index = this.input.indexOf(str, this.pos);
			if(index != -1) {
				this.pos = index + 1;
				return true;
			}
			return false;
		};

		this.newStart = function() {
			this.start = this.pos;
		};

		this.isAtEndOfLine = function(){
			return this.start >= this.input.length
		};

		this.input = input;
		this.start = 0;
		this.pos = 0;
		this.tokens = [];

		//TODO optimize lexer to have each
		//lexing function return a possible
		//next state, instead of returning to 
		//the "unkown".
		outer:
		while(!this.isAtEndOfLine()) {
			for(var fn in lexer.lex) {
				var pos = this.pos;
				lexer.lex[fn]();
				if(this.pos !== pos) continue outer;
			}
			throw "Unknown input " + lexer.next();
		}

		return this.tokens
	}

	function Parser(data) {
		this.parse = function(input) {
			var fn = window.Parser.fn;
			var parserFn = this.parse;
			var data = this.data;
			var stack = Lex(input);
			stack = convertStackFromInfixToPostfix(stack);

			var valueStack = [];

			while(stack.length > 0) {
				var item = stack.shift();
				switch(item.type) {
				case type.BOOL:
					if(item.val === 'TRUE'){
						valueStack.push(window.Parser.Bool.TRUE);
					}else if(item.val === 'FALSE'){
						valueStack.push(window.Parser.Bool.FALSE);
					}else{
						throw "Unexpeced value "+item.val;
					}
					break;
				case type.NUM:
					valueStack.push(fn.atoi(item.val));
					break;
				case type.STR:
					var str = item.val.slice(1, item.val.length - 1);
					valueStack.push(new window.Parser.String(str));
					break;
				case type.PERCENT:
					valueStack.push(fn.percent(valueStack.pop()));
					break;
				case type.SUB:
					evaluateOperator(fn.sub, valueStack);
					break;
				case type.ADD:
					evaluateOperator(fn.add, valueStack);
					break;
				case type.DIV:
					evaluateOperator(fn.div, valueStack);
					break;
				case type.MUL:
					evaluateOperator(fn.mul, valueStack);
					break;
				case type.POW:
					evaluateOperator(fn.power, valueStack);
					break;
				case type.CONCAT:
					evaluateOperator(fn.concat, valueStack);
					break;
				case type.LT:
					evaluateOperator(fn.lt, valueStack);
					break;
				case type.LE:
					evaluateOperator(fn.le, valueStack);
					break;
				case type.EQ:
					evaluateOperator(fn.eq, valueStack);
					break;
				case type.GE:
					evaluateOperator(fn.ge, valueStack);
					break;
				case type.GT:
					evaluateOperator(fn.gt, valueStack);
					break;
				case type.NE:
					evaluateOperator(fn.ne, valueStack);
					break;
				case type.ISECT:
					evaluateOperator(fn.isect, valueStack);
					break;
				case type.LIST:
					evaluateOperator(fn.list, valueStack);
					break;
				case type.PAR:
					valueStack.push(this.parse(item.val.slice(1, item.val.length - 1)));
					break;
				case type.ARR:
					var arr = this.parse(item.val.slice(1, item.val.length - 1));
					arr.isArray = true;
					valueStack.push(arr);
					break;
				case type.RANGE:
					var range = [];
					range.isRange = true;
					var b = valueStack.pop();
					var a = valueStack.pop();
					var mincol = Math.min(a.columnIndex, b.columnIndex);
					var maxcol = Math.max(a.columnIndex, b.columnIndex);
					var minrow = Math.min(a.row, b.row);
					var maxrow = Math.max(a.row, b.row);

					for(var c = mincol; c <= maxcol; c++) {
						for(var r = minrow; r <= maxrow; r++) {
							var pos = window.Parser.Ref.getColumnByIndex(c) + r;
							if(data != null && pos in data) {
								var val = data[pos];
								var ref = new window.Parser.Ref(pos, val, parserFn, this);
								range.push(ref);
							}
						}
					}
					valueStack.push([range]);
					break;
				case type.REF:
					if(data != null && item.val in data) {
						var pos = item.val
						var val = data[pos];
						var ref = new window.Parser.Ref(pos, val, parserFn, this);
						valueStack.push(ref);
						break;
					}
					valueStack.push(window.Parser.Error.NAME);
					break;
				case type.FUNC:
					var argIndex = item.val.indexOf('(');
					var functionName = item.val.substring(0,argIndex);
					var args = item.val.substring(argIndex);
					var argList = this.parse(args);
					if (!Array.isArray(argList)){
						argList = [argList];	
					}					
					argList.isArgList = true;
					valueStack.push(argList);
					evaluateFunction(functionName, valueStack);
					break;
				default:
					throw 'Unknown type' + JSON.stringify(item);
				}
			}

			if(valueStack.length === 1) {
				return valueStack[0];
			} else {
				throw "Could not evaluate " + JSON.stringify(valueStack);
			}
		},

		this.setData = function(data) {
			this.data = data;
		}

		this.data = data;

		function isOperand(token) {
			switch(token.type) {
		    case type.BOOL:
			case type.NUM:
			case type.STR:
			case type.REF:
			case type.PERCENT:
				return true;
			default:
				return false;
			}
		}

		function hasHigherOrEqualPrecedence(a, b) {
			var ap = getPrecedence(a);
			var bp = getPrecedence(b);
			return ap >= bp;
		}

		function getPrecedence(token) {
			switch(token.type) {
			case type.LIST:
				return -1;
			case type.SUB:
			case type.ADD:
				return 0;
			case type.DIV:
			case type.MUL:
				return 1;
			case type.POW:
				return 2;
			case type.RANGE:
			case type.ISECT:
			case type.FUNC:
			case type.CONCAT:
				return 3;
			case type.PAR:
			case type.ARR:
				return 4;
			default:
				throw "Unknown presedence type! " + JSON.stringify(token);
			}
		}

		function convertStackFromInfixToPostfix(stack) {

			function logStack(stack) {
				var out = "";
				stack.forEach(function(t) {
					out += t.val
				});
				return out;
			}

			var newStack = [];
			var operatorStack = [];
			while(stack.length > 0) {
				var token = stack.shift();
				console.log('new token: ' + token.val);
				if(isOperand(token)) {
					newStack.push(token);
					console.log('pushing it to stack as it is an operand: ' + logStack(newStack));
				} else {
					if(operatorStack.length === 0) {
						operatorStack.push(token);
						console.log('pushing it to operatorStack as stack is zero lenght: ' + logStack(operatorStack));
					} else {

						while(true) {
							if(operatorStack.length == 0) {
								break;
							}
							operator = operatorStack.pop();
							if(!hasHigherOrEqualPrecedence(operator, token)) {
								operatorStack.push(operator);
								break;
							}
							newStack.push(operator);
							console.log('popping operator "' + operator.val + '" (as it has higher precedence than token "' + token.val + '") and pushing it onto result: ' + logStack(newStack));
						}
						operatorStack.push(token);
						console.log('pushing operator "' + token.val + '" (as it has lower precedence): ' + logStack(operatorStack));
						
					}
				}
			}

			while(operatorStack.length > 0) {
				console.log('operator has more elements, popping and pushing');
				newStack.push(operatorStack.pop());
			}
			console.log(logStack(newStack))
			return newStack;
		}

		function evaluateOperator(evaluator, stack) {
			var args = stack.splice(-evaluator.length);
			var result = evaluator.apply(window.Parser.fn, args);
			stack.push(result);
		}

		function evaluateFunction(fnName, stack) {
			var fn = window.Parser.fn;
			if(fnName in fn) {
				var args = stack.pop();
				var result = fn[fnName].apply(fn, args);
				stack.push(result);
			} else {
				throw "Unknown function " + fnName;
			}
		}

	}

	return {
		newInstance: function(data) {
			return new Parser(data);
		},
		parse:function(input){
			return new Parser().parse(input);
		},
	};
})();

Parser.Ref = function(pos, value, p, pCtx) {
	var p = p;
	var pCtx = pCtx;
	this.valueOf = function() {	
		var value = this.referenceValue();
		if(value != null && typeof(value) === "object"){
			value = value.valueOf();
		}
		return value;
	};

	this.isNumeric = function(){		
		var v = this.valueOf();
		if(v == null) return false;
		if(Parser.fn.isString(v)){
			return v.isNumeric();
		}else{
			return !isNaN(v);
		}
	};

	this.isNumber = function(){		
		if (typeof(this.referenceValue()) === "number"){
			return true;
		}

		return false;
	};

	this.referenceValue = function(){
		if(this.value == null){
			return null;
		}
		if(typeof(this.value) === "number") {
			return this.value;
		}
		return p.call(pCtx, this.value);
	}

	this.setPosition = function(pos) {
		var col = "";
		var colIndex = -1;
		var row = "";
		for(var i = 0; i < pos.length; i++) {
			var charCode = pos.charCodeAt(i);
			var iCode = charCode - 65;
			if(charCode >= 65 && charCode <= 90) {
				//A-Z
				col += pos[i];
				colIndex += iCode + Math.pow(26, i);
			} else if(charCode >= 48 && charCode <= 57) {
				//0-9
				row += pos[i];
			}
		}
		this.column = col;
		this.row = parseInt(row);
		this.position = pos;
		this.columnIndex = colIndex;
	};
	this.toString = function(){
		return new String(this.valueOf());
	};
	this.setPosition(pos)
	this.value = value;
}

Parser.Ref.getColumnByIndex = function(i) {
	var start = 65; //A       
	if(i < 26) {
		return String.fromCharCode(i + start);
	} else {
		var n = (i) / 26 - 1;
		return f(n) + f(i % 26)
	}
}

Parser.String = function(str){

	this.toString = function(){
		return str;
	};

	this.valueOf = function(){
		return str;
	};

	this.isNumeric = function(){
		return str != null && !isNaN(str);
	};

}

Parser.Bool = function(b){
	if(b === 'TRUE'){
		b = 1;
	}else if(b === 'FALSE'){
		b = 0;
	}else{
		throw "Illegal argument, should be one of TRUE or FALSE"
	}

	this.toString = function(){
		return b ? 'TRUE' : 'FALSE';
	}

	this.valueOf = function(){
		return b;
	}

	this.toBool = function(){
		return !!b;
	}
}

Parser.Bool.TRUE = new Parser.Bool('TRUE');
Parser.Bool.FALSE = new Parser.Bool('FALSE');

Parser.Error = function(err){
	this.err = err;
	this.toString = function(){
		return this.err;
	}
}

Parser.Error.NULL = new Parser.Error('#NULL');
Parser.Error.DIVZERO = new Parser.Error('#DIV/0!');
Parser.Error.VALUE = new Parser.Error('#VALUE!');
Parser.Error.REF = new Parser.Error('#REF!');
Parser.Error.NAME = new Parser.Error('#NAME?');
Parser.Error.NUM = new Parser.Error('#NUM!');
Parser.Error.NA = new Parser.Error('#N/A');

Parser.fn = {
	//INTERNAL CONVERSION FUNCTIONS
	atoi: function(v) {
		return parseFloat(v);
	},
	percent: function(i) {
		return i / 100;
	},
	unaryMinus: function(i) {
		return -i;
	},
	unaryPlus: function(i) {
		return +i;
	},
	add: function(a, b) {
		if(!isNaN(a) && !isNaN(b)) {
			return a + b;
		}

		if(!isNaN(a) && isNaN(b)) {
			return +a;
		}
	},
	sub: function(a, b) {
		if(!isNaN(a) && !isNaN(b)) {
			return a - b;
		}

		if(!isNaN(a) && isNaN(b)) {
			return -a;
		}
	},
	mul: function(a, b) {
		return a * b;
	},
	div: function(a, b) {
		if (b === 0){
			return Parser.Error.DIVZERO;
		}
		return a / b;
	},
	power: function(b, exp) {
		return Math.pow(b, exp);
	},
	concat: function(a, b) {
		return a.toString() + b.toString();
	},
	lt: function(a, b) {
		return a < b;
	},
	le: function(a, b) {
		return a <= b;
	},
	eq: function(a, b) {
		return a === b;
	},
	ge: function(a, b) {
		return a >= b;
	},
	gt: function(a, b) {
		return a > b;
	},
	ne: function(a, b) {
		return a !== b;
	},
	isect: function(a, b) {
		return a + " " + b;
	},
	list: function(a, b) {
		if(Array.isArray(a) && Array.isArray(b)) {
			a.push.apply(b);
			return a;
		} else if(Array.isArray(a)) {
			a.push(b);
			return a;
		} else if(Array.isArray(b)) {
			b.unshift(a);
			return b;
		}
		return [a,b];
	},
	//INTRNAL HELPER FUNCTIONS
	startsWith: function(str,s){
		return str.indexOf(s) === 0;
	},
	isString: function(v){
		return v instanceof Parser.String;	
	},
	isRef: function(v){
		return v instanceof Parser.Ref;
	},
	isBool: function(v){
		return v instanceof Parser.Bool;
	},
	isError: function(v){
		return v instanceof Parser.Error;
	},
	isNumber: function(v){
		if(v == null) return false;
		if(this.isString(v)) return false;
		if(this.isBool(v)) return false;
		if(this.isError(v)) return false;		

		if(this.isRef(v)){
			return v.isNumber();
		}

		if (typeof(v) === "number") return true;		
		if (typeof(v) === "object" && typeof(v.valueOf()) === "number"){
			return true;
		}
		
		return false;
	},
	isArray: function(v){
		return Array.isArray(v) && v.isArray === true;
	},
	isRange: function(v){
		return Array.isArray(v) && v.isRange === true;
	},
	isArgList: function(v){
		return Array.isArray(v) && v.isArgList === true;
	},
	contains: function(str,s){
		return str.indexOf(s) !== -1;
	},
	getNumberOrString: function(str){
		if(!isNaN(str)){
			return parseFloat(str);
		}
		return str;
	},
	escapeRegexSpecials: function(str){
		return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	},
	//EXCEL FUNCTIONS
	"ABS": function() {
		throw "not implemented";
	},
	"ACCRINT": function() {
		throw "not implemented";
	},
	"ACCRINTM": function() {
		throw "not implemented";
	},
	"ACOS": function() {
		throw "not implemented";
	},
	"ACOSH": function() {
		throw "not implemented";
	},
	"ADDRESS": function() {
		throw "not implemented";
	},
	"AMORDEGRC": function() {
		throw "not implemented";
	},
	"AMORLINC": function() {
		throw "not implemented";
	},
	"AND": function() {
		throw "not implemented";
	},
	"AREAS": function() {
		throw "not implemented";
	},
	"ASC": function() {
		throw "not implemented";
	},
	"ASIN": function() {
		throw "not implemented";
	},
	"ASINH": function() {
		throw "not implemented";
	},
	"ATAN": function() {
		throw "not implemented";
	},
	"ATAN2": function() {
		throw "not implemented";
	},
	"ATANH": function() {
		throw "not implemented";
	},
	"AVEDEV": function() {
		throw "not implemented";
	},
	"AVERAGE": function() {
		var a = Array.prototype.slice.call(arguments);
		var filteredVals = [];
		while(a.length > 0){
			var val = a.shift();
			if(this.isNumber(val) || this.isBool(val) || Array.isArray(val)){
				filteredVals.push(val);
			}else if(this.isRef(val)){
				if(val.isNumeric()){
					filteredVals.push(val);
				}
			}else if(val != null && !isNaN(val)){
				filteredVals.push(parseFloat(val));
			}else{
				return Parser.Error.VALUE;
			}
		}
		return this.AVERAGEA.apply(this,filteredVals);
	},
	"AVERAGEA": function() {
		var a = Array.prototype.slice.call(arguments);
		var sum,avg,length;
		length = 0;
		sum = this.SUM.apply(this,a);
		if(this.isError(a)){
			return a;
		}

		for(var x = 0; x < a.length; x++){
			if(Array.isArray(a[x])){
				length += a[x].length;
			}else{
				length++;
			}
		}
		avg = this.div(sum,length);
		return avg;
	},
	"BAHTTEXT": function() {
		throw "not implemented";
	},
	"BESSELI": function() {
		throw "not implemented";
	},
	"BESSELJ": function() {
		throw "not implemented";
	},
	"BESSELK": function() {
		throw "not implemented";
	},
	"BESSELY": function() {
		throw "not implemented";
	},
	"BETA.DIST": function() {
		throw "not implemented";
	},
	"BETA.INV": function() {
		throw "not implemented";
	},
	"BETADIST": function() {
		throw "not implemented";
	},
	"BETAINV": function() {
		throw "not implemented";
	},
	"BIN2DEC": function() {
		throw "not implemented";
	},
	"BIN2HEX": function() {
		throw "not implemented";
	},
	"BIN2OCT": function() {
		throw "not implemented";
	},
	"BINOM.DIST": function() {
		throw "not implemented";
	},
	"BINOM.INV": function() {
		throw "not implemented";
	},
	"BINOMDIST": function() {
		throw "not implemented";
	},
	"CALL": function() {
		throw "not implemented";
	},
	"CEILING": function() {
		throw "not implemented";
	},
	"CELL": function() {
		throw "not implemented";
	},
	"CHAR": function() {
		throw "not implemented";
	},
	"CHIDIST": function() {
		throw "not implemented";
	},
	"CHIINV": function() {
		throw "not implemented";
	},
	"CHISQ.DIST.RT": function() {
		throw "not implemented";
	},
	"CHISQ.INV.RT": function() {
		throw "not implemented";
	},
	"CHISQ.TEST": function() {
		throw "not implemented";
	},
	"CHITEST": function() {
		throw "not implemented";
	},
	"CHOOSE": function() {
		throw "not implemented";
	},
	"CLEAN": function() {
		throw "not implemented";
	},
	"CODE": function() {
		throw "not implemented";
	},
	"COLUMN": function() {
		throw "not implemented";
	},
	"COLUMNS": function() {
		throw "not implemented";
	},
	"COMBIN": function() {
		throw "not implemented";
	},
	"COMPLEX": function() {
		throw "not implemented";
	},
	"CONCATENATE": function() {
		throw "not implemented";
	},
	"CONFIDENCE": function() {
		throw "not implemented";
	},
	"CONFIDENCE.NORM": function() {
		throw "not implemented";
	},
	"CONVERT": function() {
		throw "not implemented";
	},
	"CORREL": function() {
		throw "not implemented";
	},
	"COS": function() {
		throw "not implemented";
	},
	"COSH": function() {
		throw "not implemented";
	},
	"COUNT": function() {
		var a = Array.prototype.slice.call(arguments);
		var count = 0;	
		for(var x = 0; x < a.length; x++) {				
			var v = a[x];
			if(this.isRange(v)){
				for(var i = 0; i < v.length; i++){
					if(this.isNumber(v[i])){
						count++;
					}
				}
			}else if(this.isNumber(v) || this.isBool(v)){
				count++;
			}else if(this.isString(v) && v.isNumeric()){
				count++;
			}
		}
		return count;
	},
	"COUNTA": function() {
		throw "not implemented";
	},
	"COUNTBLANK": function() {
		throw "not implemented";
	},
	"COUNTIF": function(range,criteria) {
		var count = 0;
		for(var x = 0; x < range.length; x++){
			var cell = range[x];
			if(this.isRef(criteria) || 
				this.isBool(criteria) || 
				this.isString(criteria)){
				criteria = criteria.valueOf();
			}

			if(this.isRef(cell)){
				cell = cell.valueOf();
			}

			if(typeof(criteria) === "string"){
				var containsWildcards = false;
				if(this.contains(criteria,'*')){
					containsWildcards = true;
					criteria = criteria.split('~*')
					for(var i = 0; i < criteria.length; i++){
						criteria[i] = criteria[i].replace(/\*/g,'.*');	
					}
					criteria = criteria.join(this.escapeRegexSpecials('*'));					
				}

				if(this.contains(criteria,'?')){
					containsWildcards = true;
					criteria = criteria.split('~?')
					for(var i = 0; i < criteria.length; i++){
						criteria[i] = criteria[i].replace(/\?/g,'.');	
					}
					criteria = criteria.join(this.escapeRegexSpecials('?'));
				}

				if(containsWildcards){
					criteria = new RegExp('^'+criteria+'$');
				}
			}

			if(cell == criteria){
				count++;
			}else if(typeof(criteria) === "string"){
				if(this.startsWith(criteria,'<>')){
					if(cell != this.getNumberOrString(criteria.substring(2))) count++;
				}else if(this.startsWith(criteria,'>=')){
					if(cell >= this.getNumberOrString(criteria.substring(2))) count++;
				}else if(this.startsWith(criteria,'<=')){
					if(cell <= this.getNumberOrString(criteria.substring(2))) count++;			
				}else if(this.startsWith(criteria,'>')){
					if(cell > this.getNumberOrString(criteria.substring(1))) count++;
				}else if(this.startsWith(criteria,'<')){
					if(cell < this.getNumberOrString(criteria.substring(1))) count++;
				}
			
			}else if(criteria instanceof RegExp){
				if(criteria.test(cell)) count++;
			}
		}
		return count;
	},
	"COUPDAYBS": function() {
		throw "not implemented";
	},
	"COUPDAYS": function() {
		throw "not implemented";
	},
	"COUPDAYSNC": function() {
		throw "not implemented";
	},
	"COUPNCD": function() {
		throw "not implemented";
	},
	"COUPNUM": function() {
		throw "not implemented";
	},
	"COUPPCD": function() {
		throw "not implemented";
	},
	"COVAR": function() {
		throw "not implemented";
	},
	"COVARIANCE.P": function() {
		throw "not implemented";
	},
	"CRITBINOM": function() {
		throw "not implemented";
	},
	"CUMIPMT": function() {
		throw "not implemented";
	},
	"CUMPRINC": function() {
		throw "not implemented";
	},
	"DATE": function() {
		throw "not implemented";
	},
	"DATEVALUE": function() {
		throw "not implemented";
	},
	"DAVERAGE": function() {
		throw "not implemented";
	},
	"DAY": function() {
		throw "not implemented";
	},
	"DAYS360": function() {
		throw "not implemented";
	},
	"DB": function() {
		throw "not implemented";
	},
	"DCOUNT": function() {
		throw "not implemented";
	},
	"DCOUNTA": function() {
		throw "not implemented";
	},
	"DDB": function() {
		throw "not implemented";
	},
	"DEC2BIN": function() {
		throw "not implemented";
	},
	"DEC2HEX": function() {
		throw "not implemented";
	},
	"DEC2OCT": function() {
		throw "not implemented";
	},
	"DEGREES": function() {
		throw "not implemented";
	},
	"DELTA": function() {
		throw "not implemented";
	},
	"DEVSQ": function() {
		throw "not implemented";
	},
	"DGET": function() {
		throw "not implemented";
	},
	"DISC": function() {
		throw "not implemented";
	},
	"DMAX": function() {
		throw "not implemented";
	},
	"DMIN": function() {
		throw "not implemented";
	},
	"DOLLAR": function() {
		throw "not implemented";
	},
	"DOLLARDE": function() {
		throw "not implemented";
	},
	"DOLLARFR": function() {
		throw "not implemented";
	},
	"DPRODUCT": function() {
		throw "not implemented";
	},
	"DSTDEV": function() {
		throw "not implemented";
	},
	"DSTDEVP": function() {
		throw "not implemented";
	},
	"DSUM": function() {
		throw "not implemented";
	},
	"DURATION": function() {
		throw "not implemented";
	},
	"DVAR": function() {
		throw "not implemented";
	},
	"DVARP": function() {
		throw "not implemented";
	},
	"EDATE": function() {
		throw "not implemented";
	},
	"EFFECT": function() {
		throw "not implemented";
	},
	"EOMONTH": function() {
		throw "not implemented";
	},
	"ERF": function() {
		throw "not implemented";
	},
	"ERF.PRECISE": function() {
		throw "not implemented";
	},
	"ERFC": function() {
		throw "not implemented";
	},
	"ERFC.PRECISE": function() {
		throw "not implemented";
	},
	"ERROR.TYPE": function() {
		throw "not implemented";
	},
	"EUROCONVERT": function() {
		throw "not implemented";
	},
	"EVEN": function() {
		throw "not implemented";
	},
	"EXACT": function() {
		throw "not implemented";
	},
	"EXP": function() {
		throw "not implemented";
	},
	"EXPON.DIST": function() {
		throw "not implemented";
	},
	"EXPONDIST": function() {
		throw "not implemented";
	},
	"F.DIST.RT": function() {
		throw "not implemented";
	},
	"F.INV.RT": function() {
		throw "not implemented";
	},
	"F.TEST": function() {
		throw "not implemented";
	},
	"FACT": function() {
		throw "not implemented";
	},
	"FACTDOUBLE": function() {
		throw "not implemented";
	},
	"FALSE": function() {
		return Parser.Bool.FALSE;
	},
	"FDIST": function() {
		throw "not implemented";
	},
	"FIND": function() {
		throw "not implemented";
	},
	"FINDB": function() {
		throw "not implemented";
	},
	"FINV": function() {
		throw "not implemented";
	},
	"FISHER": function() {
		throw "not implemented";
	},
	"FISHERINV": function() {
		throw "not implemented";
	},
	"FIXED": function() {
		throw "not implemented";
	},
	"FLOOR": function() {
		throw "not implemented";
	},
	"FORECAST": function() {
		throw "not implemented";
	},
	"FREQUENCY": function() {
		throw "not implemented";
	},
	"FTEST": function() {
		throw "not implemented";
	},
	"FV": function() {
		throw "not implemented";
	},
	"FVSCHEDULE": function() {
		throw "not implemented";
	},
	"GAMMA.DIST": function() {
		throw "not implemented";
	},
	"GAMMA.INV": function() {
		throw "not implemented";
	},
	"GAMMADIST": function() {
		throw "not implemented";
	},
	"GAMMAINV": function() {
		throw "not implemented";
	},
	"GAMMALN": function() {
		throw "not implemented";
	},
	"GAMMALN.PRECISE": function() {
		throw "not implemented";
	},
	"GCD": function() {
		throw "not implemented";
	},
	"GEOMEAN": function() {
		throw "not implemented";
	},
	"GESTEP": function() {
		throw "not implemented";
	},
	"GETPIVOTDATA": function() {
		throw "not implemented";
	},
	"GROWTH": function() {
		throw "not implemented";
	},
	"HARMEAN": function() {
		throw "not implemented";
	},
	"HEX2BIN": function() {
		throw "not implemented";
	},
	"HEX2DEC": function() {
		throw "not implemented";
	},
	"HEX2OCT": function() {
		throw "not implemented";
	},
	"HLOOKUP": function() {
		throw "not implemented";
	},
	"HOUR": function() {
		throw "not implemented";
	},
	"HYPERLINK": function() {
		throw "not implemented";
	},
	"HYPGEOM.DIST": function() {
		throw "not implemented";
	},
	"HYPGEOMDIST": function() {
		throw "not implemented";
	},
	"IF": function() {
		throw "not implemented";
	},
	"IMABS": function() {
		throw "not implemented";
	},
	"IMAGINARY": function() {
		throw "not implemented";
	},
	"IMARGUMENT": function() {
		throw "not implemented";
	},
	"IMCONJUGATE": function() {
		throw "not implemented";
	},
	"IMCOS": function() {
		throw "not implemented";
	},
	"IMDIV": function() {
		throw "not implemented";
	},
	"IMEXP": function() {
		throw "not implemented";
	},
	"IMLN": function() {
		throw "not implemented";
	},
	"IMLOG10": function() {
		throw "not implemented";
	},
	"IMLOG2": function() {
		throw "not implemented";
	},
	"IMPOWER": function() {
		throw "not implemented";
	},
	"IMPRODUCT": function() {
		throw "not implemented";
	},
	"IMREAL": function() {
		throw "not implemented";
	},
	"IMSIN": function() {
		throw "not implemented";
	},
	"IMSQRT": function() {
		throw "not implemented";
	},
	"IMSUB": function() {
		throw "not implemented";
	},
	"IMSUM": function() {
		throw "not implemented";
	},
	"INDEX": function() {
		throw "not implemented";
	},
	"INDIRECT": function() {
		throw "not implemented";
	},
	"INFO": function() {
		throw "not implemented";
	},
	"INT": function() {
		throw "not implemented";
	},
	"INTERCEPT": function() {
		throw "not implemented";
	},
	"INTRATE": function() {
		throw "not implemented";
	},
	"IPMT": function() {
		throw "not implemented";
	},
	"IRR": function() {
		throw "not implemented";
	},
	"ISODD": function() {
		throw "not implemented";
	},
	"ISPMT": function() {
		throw "not implemented";
	},
	"ISTEXT": function() {
		throw "not implemented";
	},
	"JIS": function() {
		throw "not implemented";
	},
	"KURT": function() {
		throw "not implemented";
	},
	"LARGE": function() {
		throw "not implemented";
	},
	"LCM": function() {
		throw "not implemented";
	},
	"LEFT": function() {
		throw "not implemented";
	},
	"LEFTB": function() {
		throw "not implemented";
	},
	"LEN": function() {
		throw "not implemented";
	},
	"LENB": function() {
		throw "not implemented";
	},
	"LINEST": function() {
		throw "not implemented";
	},
	"LN": function() {
		throw "not implemented";
	},
	"LOG": function() {
		throw "not implemented";
	},
	"LOG10": function() {
		throw "not implemented";
	},
	"LOGEST": function() {
		throw "not implemented";
	},
	"LOGINV": function() {
		throw "not implemented";
	},
	"LOGNORM.DIST": function() {
		throw "not implemented";
	},
	"LOGNORM.INV": function() {
		throw "not implemented";
	},
	"LOGNORMDIST": function() {
		throw "not implemented";
	},
	"LOOKUP": function() {
		throw "not implemented";
	},
	"LOWER": function() {
		throw "not implemented";
	},
	"MATCH": function() {
		throw "not implemented";
	},
	"MAX": function() {
		throw "not implemented";
	},
	"MAXA": function() {
		throw "not implemented";
	},
	"MDETERM": function() {
		throw "not implemented";
	},
	"MDURATION": function() {
		throw "not implemented";
	},
	"MEDIAN": function() {
		throw "not implemented";
	},
	"MID": function() {
		throw "not implemented";
	},
	"MIDB": function() {
		throw "not implemented";
	},
	"MIN": function() {
		throw "not implemented";
	},
	"MINA": function() {
		throw "not implemented";
	},
	"MINUTE": function() {
		throw "not implemented";
	},
	"MINVERSE": function() {
		throw "not implemented";
	},
	"MIRR": function() {
		throw "not implemented";
	},
	"MMULT": function() {
		throw "not implemented";
	},
	"MOD": function() {
		throw "not implemented";
	},
	"MODE": function() {
		throw "not implemented";
	},
	"MODE.SNGL": function() {
		throw "not implemented";
	},
	"MONTH": function() {
		throw "not implemented";
	},
	"MROUND": function() {
		throw "not implemented";
	},
	"MULTINOMIAL": function() {
		throw "not implemented";
	},
	"N": function() {
		throw "not implemented";
	},
	"NA": function() {
		throw "not implemented";
	},
	"NEGBINOM.DIST": function() {
		throw "not implemented";
	},
	"NEGBINOMDIST": function() {
		throw "not implemented";
	},
	"NETWORKDAYS": function() {
		throw "not implemented";
	},
	"NOMINAL": function() {
		throw "not implemented";
	},
	"NORM.DIST": function() {
		throw "not implemented";
	},
	"NORM.INV": function() {
		throw "not implemented";
	},
	"NORM.S.DIST": function() {
		throw "not implemented";
	},
	"NORM.S.INV": function() {
		throw "not implemented";
	},
	"NORMDIST": function() {
		throw "not implemented";
	},
	"NORMINV": function() {
		throw "not implemented";
	},
	"NORMSDIST": function() {
		throw "not implemented";
	},
	"NORMSINV": function() {
		throw "not implemented";
	},
	"NOT": function() {
		throw "not implemented";
	},
	"NOW": function() {
		throw "not implemented";
	},
	"NPER": function() {
		throw "not implemented";
	},
	"NPV": function() {
		throw "not implemented";
	},
	"OCT2BIN": function() {
		throw "not implemented";
	},
	"OCT2DEC": function() {
		throw "not implemented";
	},
	"OCT2HEX": function() {
		throw "not implemented";
	},
	"ODD": function() {
		throw "not implemented";
	},
	"ODDFPRICE": function() {
		throw "not implemented";
	},
	"ODDFYIELD": function() {
		throw "not implemented";
	},
	"ODDLPRICE": function() {
		throw "not implemented";
	},
	"ODDLYIELD": function() {
		throw "not implemented";
	},
	"OFFSET": function() {
		throw "not implemented";
	},
	"OR": function() {
		throw "not implemented";
	},
	"PEARSON": function() {
		throw "not implemented";
	},
	"PERCENTILE": function(array,P) {
		if(!this.isNumber(P)) return Error.VALUE;
		if(P > 1 || P < 0) return Error.NUM;
		
		if(this.isRange(array)){
			var a = array;
			array = [];
			for(var x = 0; x < a.length; x++){
				array[x] = a[x].valueOf();
			}
		}
		array.sort();
		var N = array.length;
		var n = (N - 1) * P + 1;		
		if (k === 1){
			return array[0];
		}else if(k === N){
			return array[N-1];
		}else{
			var k = Math.floor(n);
			var d = n % 1;
			return array[k-1]+d*(array[k]-array[k-1]);
		}
	},
	"PERCENTILE.INC": function() {
		throw "not implemented";
	},
	"PERCENTRANK": function() {
		throw "not implemented";
	},
	"PERCENTRANK.INC": function() {
		throw "not implemented";
	},
	"PERMUT": function() {
		throw "not implemented";
	},
	"PHONETIC": function() {
		throw "not implemented";
	},
	"PI": function() {
		throw "not implemented";
	},
	"PMT": function() {
		throw "not implemented";
	},
	"POISSON": function() {
		throw "not implemented";
	},
	"POISSON.DIST": function() {
		throw "not implemented";
	},
	"POWER": function() {
		throw "not implemented";
	},
	"PPMT": function() {
		throw "not implemented";
	},
	"PRICE": function() {
		throw "not implemented";
	},
	"PRICEDISC": function() {
		throw "not implemented";
	},
	"PRICEMAT": function() {
		throw "not implemented";
	},
	"PROB": function() {
		throw "not implemented";
	},
	"PRODUCT": function() {
		throw "not implemented";
	},
	"PROPER": function() {
		throw "not implemented";
	},
	"PV": function() {
		throw "not implemented";
	},
	"QUARTILE": function() {
		throw "not implemented";
	},
	"QUARTILE.INC": function() {
		throw "not implemented";
	},
	"QUOTIENT": function() {
		throw "not implemented";
	},
	"RADIANS": function() {
		throw "not implemented";
	},
	"RAND": function() {
		throw "not implemented";
	},
	"RANDBETWEEN": function() {
		throw "not implemented";
	},
	"RANK": function() {
		throw "not implemented";
	},
	"RANK.EQ": function() {
		throw "not implemented";
	},
	"RATE": function() {
		throw "not implemented";
	},
	"RECEIVED": function() {
		throw "not implemented";
	},
	"REGISTER.ID": function() {
		throw "not implemented";
	},
	"REPLACE": function() {
		throw "not implemented";
	},
	"REPLACEB": function() {
		throw "not implemented";
	},
	"REPT": function() {
		throw "not implemented";
	},
	"RIGHT": function() {
		throw "not implemented";
	},
	"RIGHTB": function() {
		throw "not implemented";
	},
	"ROMAN": function() {
		throw "not implemented";
	},
	"ROUND": function() {
		throw "not implemented";
	},
	"ROUNDDOWN": function() {
		throw "not implemented";
	},
	"ROUNDUP": function() {
		throw "not implemented";
	},
	"ROW": function() {
		throw "not implemented";
	},
	"ROWS": function() {
		throw "not implemented";
	},
	"RSQ": function() {
		throw "not implemented";
	},
	"RTD": function() {
		throw "not implemented";
	},
	"SEARCH": function() {
		throw "not implemented";
	},
	"SEARCHB": function() {
		throw "not implemented";
	},
	"SECOND": function() {
		throw "not implemented";
	},
	"SERIESSUM": function() {
		throw "not implemented";
	},
	"SIGN": function() {
		throw "not implemented";
	},
	"SIN": function() {
		throw "not implemented";
	},
	"SINH": function() {
		throw "not implemented";
	},
	"SKEW": function() {
		throw "not implemented";
	},
	"SLN": function() {
		throw "not implemented";
	},
	"SLOPE": function() {
		throw "not implemented";
	},
	"SMALL": function() {
		throw "not implemented";
	},
	"SQL.REQUEST": function() {
		throw "not implemented";
	},
	"SQRT": function() {
		throw "not implemented";
	},
	"SQRTPI": function() {
		throw "not implemented";
	},
	"STANDARDIZE": function() {
		throw "not implemented";
	},
	"STDEV": function() {
		throw "not implemented";
	},
	"STDEV.P": function() {
		throw "not implemented";
	},
	"STDEV.S": function() {
		throw "not implemented";
	},
	"STDEVA": function() {
		throw "not implemented";
	},
	"STDEVP": function() {
		throw "not implemented";
	},
	"STDEVPA": function() {
		throw "not implemented";
	},
	"STEYX": function() {
		throw "not implemented";
	},
	"SUBSTITUTE": function() {
		throw "not implemented";
	},
	"SUBTOTAL": function() {
		throw "not implemented";
	},
	"SUM": function() {
		var a = Array.prototype.slice.call(arguments);
		var sum = 0;
		for(var x = 0; x < a.length; x++) {			
			if(this.isError(a[x])){
				return a[x];
			}

			if(this.isNumber(a[x]) || this.isBool(a[x])) {					
				sum += a[x];
			}else if (this.isRef(a[x])){
				if(a[x].isNumeric()){
					sum += parseFloat(a[x]);
				}			
			}else if(Array.isArray(a[x])){
				sum += this.SUM.apply(this,a[x]);
			}else if (!isNaN(a[x])){
				sum += parseFloat(a[x]);
			}else{
				return Parser.Error.VALUE;
			}
		}
		return sum;
	},
	"SUMIF": function() {
		throw "not implemented";
	},
	"SUMPRODUCT": function() {
		throw "not implemented";
	},
	"SUMSQ": function() {
		throw "not implemented";
	},
	"SUMX2MY2": function() {
		throw "not implemented";
	},
	"SUMX2PY2": function() {
		throw "not implemented";
	},
	"SUMXMY2": function() {
		throw "not implemented";
	},
	"SYD": function() {
		throw "not implemented";
	},
	"T": function() {
		throw "not implemented";
	},
	"T.DIST.2T": function() {
		throw "not implemented";
	},
	"T.DIST.RT": function() {
		throw "not implemented";
	},
	"T.INV.2T": function() {
		throw "not implemented";
	},
	"T.TEST": function() {
		throw "not implemented";
	},
	"TAN": function() {
		throw "not implemented";
	},
	"TANH": function() {
		throw "not implemented";
	},
	"TBILLEQ": function() {
		throw "not implemented";
	},
	"TBILLPRICE": function() {
		throw "not implemented";
	},
	"TBILLYIELD": function() {
		throw "not implemented";
	},
	"TDIST": function() {
		throw "not implemented";
	},
	"TEXT": function() {
		throw "not implemented";
	},
	"TIME": function() {
		throw "not implemented";
	},
	"TIMEVALUE": function() {
		throw "not implemented";
	},
	"TINV": function() {
		throw "not implemented";
	},
	"TODAY": function() {
		throw "not implemented";
	},
	"TRANSPOSE": function() {
		throw "not implemented";
	},
	"TREND": function() {
		throw "not implemented";
	},
	"TRIM": function() {
		throw "not implemented";
	},
	"TRIMMEAN": function() {
		throw "not implemented";
	},
	"TRUE": function() {
		return Parser.Bool.TRUE;
	},
	"TRUNC": function() {
		throw "not implemented";
	},
	"TTEST": function() {
		throw "not implemented";
	},
	"TYPE": function() {
		throw "not implemented";
	},
	"UPPER": function() {
		throw "not implemented";
	},
	"VALUE": function() {
		throw "not implemented";
	},
	"VAR": function() {
		throw "not implemented";
	},
	"VAR.P": function() {
		throw "not implemented";
	},
	"VAR.S": function() {
		throw "not implemented";
	},
	"VARA": function() {
		throw "not implemented";
	},
	"VARP": function() {
		throw "not implemented";
	},
	"VARPA": function() {
		throw "not implemented";
	},
	"VDB": function() {
		throw "not implemented";
	},
	"VLOOKUP": function() {
		throw "not implemented";
	},
	"WEEKDAY": function() {
		throw "not implemented";
	},
	"WEEKNUM": function() {
		throw "not implemented";
	},
	"WEIBULL": function() {
		throw "not implemented";
	},
	"WEIBULL.DIST": function() {
		throw "not implemented";
	},
	"WORKDAY": function() {
		throw "not implemented";
	},
	"XIRR": function() {
		throw "not implemented";
	},
	"XNPV": function() {
		throw "not implemented";
	},
	"YEAR": function() {
		throw "not implemented";
	},
	"YEARFRAC": function() {
		throw "not implemented";
	},
	"YIELD": function() {
		throw "not implemented";
	},
	"YIELDDISC": function() {
		throw "not implemented";
	},
	"YIELDMAT": function() {
		throw "not implemented";
	},
	"Z.TEST": function() {
		throw "not implemented";
	},
	"ZTEST": function() {
		throw "not implemented";
	},
	"ISBLANK": function() {
		throw "not implemented";
	},
	"ISERR": function(v) {
		if(v === Parser.Error.NA){
			return v;
		}
		return this.ISERROR(v);
	},
	"ISERROR": function(v) {
		if(this.isError(v)){
			return Parser.Bool.TRUE;
		}
		return Parser.Bool.FALSE;		
	},
	"ISLOGICAL": function() {
		if(this.isBool(v)){
			return Parser.Bool.TRUE;
		}
		return Parser.Bool.FALSE;	
	},
	"ISNA": function() {
		throw "not implemented";
	},
	"ISNONTEXT": function() {
		throw "not implemented";
	},
	"ISNUMBER": function(value) {
		if(this.isNumber(value)){
			return Parser.Bool.TRUE;	
		}
		return Parser.Bool.FALSE;	
	},
	"ISREF": function(v) {
		if(this.isRef(v)){
			return Parser.Bool.TRUE;
		}
		return Parser.Bool.FALSE;	
	},
	"ISTEXT	": function(v) {
		if(this.isString(v)){
			return Parser.Bool.TRUE;
		}
		return Parser.Bool.FALSE;	
	},
}