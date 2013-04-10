var EFP = (function() {

	var type = {
		NUM: 'number',
		STR: 'string',
		PERCENT: 'percent',
		SUB: 'subtraction',
		ADD: 'addition',
		DIV: 'division',
		MUL: 'multiplication',
		POW: 'power',
		CONCAT: 'concatenation',
		LT: 'lessThan',
		LE: 'lessThanOrEqual',
		EQ: 'equal',
		GE: 'greaterThanOrEqual',
		GT: 'greaterThan',
		NE: 'notEqual',
		ISECT: 'intersection',
		LIST: 'list',
		RANGE: 'range',
		REF: 'reference',
		FUNC: 'func',
		BOOL: 'boolean',
		PAR:'parenthesis',
		ARR:'array'
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
			whitespace: function(){
				if(lexer.isNextConsume(' ')){
					lexer.newStart();
				}
			},
			str: function() {
				if(lexer.isNextConsume('"')) {
					if(lexer.ignoreUntil('"')) {
						lexer.emit(type.STR);
					} else {
						throw "Error occured parsing string!";
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
				if(lexer.accept("$ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
					lexer.emit(type.REF);
				}
			}
		};

		this.next = function() {
			var n = this.input[this.pos];
			this.pos++;
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
			var b = 1;
			if(lexer.isNextConsume(startChar)) {
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
		};

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
			return this.start >= this.input.length;
		};

		this.input = input;
		this.start = 0;
		this.pos = 0;
		this.tokens = [];

		//formula start
		if(this.isNextConsume('=')){
			if(this.input.length > 1){
				newStart();
			}else{
				this.emit(type.STR);
			}
		}

		//TODO optimize lexer to have each
		//lexing function return a possible
		//next state, instead of returning to 
		//the "unknown".
		outer:
		while(!this.isAtEndOfLine()) {
			for(var fn in lexer.lex) {
				var pos = this.pos;
				lexer.lex[fn]();
				if(this.pos !== pos) continue outer;
			}
			throw "Unknown input " + lexer.next() + " in: "+ this.input;
		}

		return this.tokens;
	}

	function Parser(data) {
		var references;
		var scope = this;
		var fn = EFP.fn;

		var evaluator = {
			evaluateOperator: function(eFn, s) {
				var result;
				var args;
				if(eFn.length === 0){
					args = s.splice(0,s.length);
				}else{
					args = s.splice(s.length-eFn.length,eFn.length);
				}
				for (var x = 0; x < eFn.length; x++){
					if(args[x] === undefined){
						result = EFP.Error.VALUE;
						break;
					}
					if(fn.isRef(args[x])){
						if(fn.isError(args[x].value)){
							result = args[x].value;
							break;
						}
						if(args[x].value === undefined || args[x].value === null){
							args[x] = '';
						}
					}
					if(fn.isError(args[x])){
						result = args[x];
						break;
					}
				}
				if(!result){
					result = eFn.apply(fn, args);
				}
				s.push(result);
			},
			evaluateFunction: function(fnName, s) {
				if(fnName in fn) {
					var args = s.pop();
					var result = fn[fnName].apply(fn, args);
					s.push(result);
				} else {
					throw "Unknown function " + fnName;
				}
			},
			addReference: function(id,pos,refs){
				if(refs){
					if(!refs[id]){
						refs[id] = {};
					}
					refs[id][pos] = true;
				}
			},
			number: function(item,s){
				s.push(fn.atoi(item.val));
			},
			string: function(item,s){
				var str = item.val.slice(1, item.val.length - 1);
				s.push(new EFP.String(str));
			},
			percent: function(item,s){
				s.push(fn.percent(s.pop()));
			},
			subtraction: function(item,s){
				this.evaluateOperator(fn.sub, s);
			},
			addition: function(item,s){
				this.evaluateOperator(fn.add, s);
			},
			division: function(item,s){
				this.evaluateOperator(fn.div, s);
			},
			multiplication: function(item,s){
				this.evaluateOperator(fn.mul, s);
			},
			power: function(item,s){
				this.evaluateOperator(fn.power, s);
			},
			concatenation: function(item,s){
				this.evaluateOperator(fn.concat, s);
			},
			lessThan:function(item,s){
				this.evaluateOperator(fn.lt, s);
			},
			lessThanOrEqual: function(item,s){
				this.evaluateOperator(fn.le, s);
			},
			equal: function(item,s){
				this.evaluateOperator(fn.eq, s);
			},
			greaterThanOrEqual: function(item,s){
				this.evaluateOperator(fn.ge, s);
			},
			greaterThan: function(item,s){
				this.evaluateOperator(fn.gt, s);
			},
			notEqual: function(item,s){
				this.evaluateOperator(fn.ne, s);
			},
			intersection: function(item,s){
				this.evaluateOperator(fn.isect, s);
			},
			list: function(item,s){
				var args = s.splice(s.length-fn.list.length,fn.list.length);
				s.push(fn.list.apply(fn,args));
			},
			boolean: function(item,s){
				if(item.val === 'TRUE'){
					s.push(EFP.Bool.TRUE);
				}else if(item.val === 'FALSE'){
					s.push(EFP.Bool.FALSE);
				}else{
					throw "Unexpeced value "+item.val;
				}
			},
			parenthesis: function(item,s,id){
				s.push(scope.parse(item.val.slice(1, item.val.length - 1),id));
			},
			array: function(item,s,id){
				var arr = scope.parse(item.val.slice(1, item.val.length - 1),id);
				arr.isArray = true;
				s.push(arr);
			},
			range:  function(item,s,id,refs,data){
				var b = s.pop();
				var a = s.pop();
				var range = [];
				range.isRange = true;
				var mincol = Math.min(a.columnIndex, b.columnIndex);
				var maxcol = Math.max(a.columnIndex, b.columnIndex);
				var minrow,maxrow;

				if(!(b.isColumnReference() || a.isColumnReference())){
					minrow = Math.min(a.row, b.row);
					maxrow = Math.max(a.row, b.row);
				}else{
					//TODO needs optimization
					minrow = 1;
					maxrow = 65536;
				}

				for(var c = mincol; c <= maxcol; c++) {
					for(var r = minrow; r <= maxrow; r++) {
						var pos = EFP.Ref.getColumnByIndex(c) + r;
						this.addReference(id,pos,refs);
						if(data && pos in data) {
							var val = data[pos];
							var ref = new EFP.Ref(pos, val, {
								context: this,
								fn: scope.parse,
								id: id
							});
							range.push(ref);
						}
					}
				}
				s.push([range]);
			},
			reference: function(item,s,id,refs,data){
				var pos = item.val;
				if(pos.indexOf('$') !== -1){
					pos = pos.replace(/\$/g,'');
				}
				this.addReference(id,pos,refs);

				var val;
				if(data && pos in data) {
					val = data[pos];
				}else{
					val = null;
				}
				var ref = new EFP.Ref(pos, val, {
								context: this,
								fn: scope.parse,
								id: id
							});
				s.push(ref);
			},
			func: function(item,s,id){
				var argIndex = item.val.indexOf('(');
				var functionName = item.val.substring(0,argIndex);
				var args = item.val.substring(argIndex);
				var argList;
				if (args === '()'){
					//zero arguments
					argList = [];
				}else{
					//parse one or more arguments
					argList = scope.parse(args,id);
				}

				if (!(argList instanceof Array)){
					argList = [argList];
				}
				argList.isArgList = true;
				s.push(argList);
				this.evaluateFunction(functionName, s);
			}
		};

		this.getReferences = function(id){
			if(!this.hasReferences(id)){
				return null;
			}

			var refs = [];
			for (var key in references[id]){
				refs.push(key);
			}

			return refs;
		};

		this.hasReferences = function(id){
			if(references && references[id]){
				return true;
			}
			return false;
		};

		this.parse = function(input,id) {

			if(id && !references){
				references = {};
			}

			if(typeof(input) !== 'string'){
				if(fn.isError(input)) return input;
				throw 'Expected string as input';
			}

			var data = this.data;
			var stack = Lex(input);
			stack = convertStackFromInfixToPostfix(stack);

			var valueStack = [];

			while(stack.length > 0) {
				var item = stack.shift();
				if(evaluator[item.type] === undefined){
					throw 'No handler for type: ' + JSON.stringify(item);
				}
				var args = [item,valueStack,id,references,data];
				evaluator[item.type].apply(evaluator,args);
			}

			if(valueStack.length === 1) {
				return valueStack[0];
			} else if(valueStack.length === 0) {
				return null;
			}else{
				throw "Could not evaluate " + JSON.stringify(valueStack);
			}
		},

		this.setData = function(data) {
			this.data = data;
		};

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
			case type.EQ:
			case type.LT:
			case type.LE:
			case type.GE:
			case type.GT:
			case type.NE:
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
					out += t.val;
				});
				return out;
			}

			var newStack = [];
			var operatorStack = [];
			while(stack.length > 0) {
				var token = stack.shift();
				////console.log('new token: ' + token.val);
				if(isOperand(token)) {
					newStack.push(token);
					//console.log('pushing it to stack as it is an operand: ' + logStack(newStack));
				} else {
					if(operatorStack.length === 0) {
						operatorStack.push(token);
						//console.log('pushing it to operatorStack as stack is zero lenght: ' + logStack(operatorStack));
					} else {

						while(true) {
							if(operatorStack.length === 0) {
								break;
							}
							operator = operatorStack.pop();
							if(!hasHigherOrEqualPrecedence(operator, token)) {
								operatorStack.push(operator);
								break;
							}
							newStack.push(operator);
							//console.log('popping operator "' + operator.val + '" (as it has higher precedence than token "' + token.val + '") and pushing it onto result: ' + logStack(newStack));
						}
						operatorStack.push(token);
						//console.log('pushing operator "' + token.val + '" (as it has lower precedence): ' + logStack(operatorStack));
					}
				}
			}

			while(operatorStack.length > 0) {
				//console.log('operator has more elements, popping and pushing');
				newStack.push(operatorStack.pop());
			}
			//console.log(logStack(newStack))
			return newStack;
		}
	}

	return {
		newInstance: function(data) {
			return new Parser(data);
		},
		parse:function(input,id){
			return new Parser().parse(input,id);
		}
	};

})();

//init static constants
(function(){

	function Error(err){
		this.err = err;
		this.toString = function(){
			return this.err;
		};
	}

	function Bool(b){
		if(b === 'TRUE'){
			b = 1;
		}else if(b === 'FALSE'){
			b = 0;
		}else{
			throw "Illegal argument, should be one of TRUE or FALSE";
		}

		this.toString = function(){
			return b ? 'TRUE' : 'FALSE';
		};

		this.valueOf = function(){
			return b;
		};

		this.toBool = function(){
			return !!b;
		};
	}

	EFP.Error = {
		NULL: new Error('#NULL'),
		DIVZERO:new Error('#DIV/0!'),
		VALUE:new Error('#VALUE!'),
		REF:new Error('#REF!'),
		NAME:new Error('#NAME?'),
		NUM:new Error('#NUM!'),
		NA:new Error('#N/A')
	};

	EFP.Ref = function(pos, value, fnObj) {
		this.valueOf = function() {
			var value = this.referenceValue();
			while(value && typeof(value) === "object"){
				value = value.valueOf();
			}
			return value;
		};

		this.isNumeric = function(){
			var v = this.referenceValue();
			if(v === null) return false;
			if(EFP.fn.isString(v)){
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
			if(typeof(this.value) === "number") {
				return this.value;
			}
			if(!this.value){
				return null;
			}
			return fnObj.fn.call(fnObj.context, this.value, fnObj.id);
		};

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
			if(row.length > 0){
				this.row = parseInt(row,10);
			}
			this.position = pos;
			this.columnIndex = colIndex;
		};
		this.toString = function(){
			return ''+this.valueOf();
		};

		this.isColumnReference = function(){
			return !!this.column && !this.row;
		};

		this.setPosition(pos);

		//if value is not primitive, try to convert
		if(value !== null && !EFP.fn.isError(value) && typeof(value) === "object"){
			if(!value.valueOf) throw "Data object doesn't implement valueOf()";
			value = value.valueOf();
			if(value !== null && typeof(value) === "object") throw "Data object did not return formula as a primitive!";
		}

		this.value = value;
	};

	EFP.Ref.getColumnByIndex = function(i) {
		var start = 65; //A       
		if(i < 26) {
			return String.fromCharCode(i + start);
		} else {
			var n = (i) / 26 - 1;
			return f(n) + f(i % 26);
		}
	};



	EFP.String = function(str){

		this.toString = function(){
			return str;
		};

		this.valueOf = function(){
			return str;
		};

		this.isNumeric = function(){
			if(str.replace(/(^\s+|\s+$)/g,'') === '') return false;
			return !isNaN(str);
		};

		if(typeof(str) !== 'string') throw "Expected string as input!";

	};

	EFP.Bool = {
		TRUE: new Bool('TRUE'),
		FALSE: new Bool('FALSE')
	};

	EFP.fn = {
		//INTERNAL CONVERSION FUNCTIONS
		atoi: function(v) {
			return parseFloat(v);
		},
		percent: function(i) {
			return i / 100;
		},
		add: function() {
			if(arguments.length == 1){
				return +arguments[0];
			}else if(arguments.length == 2){
				return arguments[0] + arguments[1];
			}else{
				return EFP.Error.VALUE;
			}
		},
		sub: function() {
			if(arguments.length == 1){
				return -arguments[0];
			}else if(arguments.length == 2){
				return arguments[0] - arguments[1];
			}else{
				return EFP.Error.VALUE;
			}
		},
		mul: function(a, b) {
			return a * b;
		},
		div: function(a, b) {
			if (b === 0){
				return EFP.Error.DIVZERO;
			}
			return a / b;
		},
		power: function(b, exp) {
			return Math.pow(b, exp);
		},
		concat: function(a, b) {
			return (''+a)+(''+b);
		},
		lt: function(a, b) {
			if(a < b) return EFP.Bool.TRUE;
			return EFP.Bool.FALSE;
		},
		le: function(a, b) {
			if(a <= b) return EFP.Bool.TRUE;
			return EFP.Bool.FALSE;
		},
		eq: function(a, b) {
			if(a == b) return EFP.Bool.TRUE;
			return EFP.Bool.FALSE;
		},
		ge: function(a, b) {
			if(a >= b) return EFP.Bool.TRUE;
			return EFP.Bool.FALSE;
		},
		gt: function(a, b) {
			if(a > b) return EFP.Bool.TRUE;
			return EFP.Bool.FALSE;
		},
		ne: function(a, b) {
			if(a !== b) return EFP.Bool.TRUE;
			return EFP.Bool.FALSE;
		},
		isect: function(a, b) {
			return a + " " + b;
		},
		list: function(a, b) {
			if(a instanceof Array && b instanceof Array) {
				a.push.apply(b);
				return a;
			} else if(a instanceof Array) {
				a.push(b);
				return a;
			} else if(b instanceof Array) {
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
			return v instanceof EFP.String;
		},
		isRef: function(v){
			return v instanceof EFP.Ref;
		},
		isBool: function(v){
			return v instanceof Bool;
		},
		isError: function(v){
			return v instanceof Error;
		},
		//Returns true if the value is a true number.
		isNumber: function(v){
			if(v === undefined || v === null) return false;
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
		//Returns true if the value seems to be a number
		isNumeric:function(v){
			if(v === undefined || v === null) return false;
			if(this.isString(v)){
				return v.isNumeric();
			}
			if(this.isBool(v)) return false;
			if(this.isError(v)) return false;

			if(this.isRef(v)){
				return v.isNumeric();
			}

			if (typeof(v) === "object"){
				return this.isNumeric(v.valueOf());
			}

			return false;
		},
		isArray: function(v){
			return v instanceof Array && v.isArray === true;
		},
		isRange: function(v){
			return v instanceof Array && v.isRange === true;
		},
		isArgList: function(v){
			return v instanceof Array && v.isArgList === true;
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
				if(this.isNumber(val) || this.isBool(val) || val instanceof Array){
					filteredVals.push(val);
				}else if(this.isRef(val)){
					if(this.isNumeric(val)){
						filteredVals.push(val);
					}
				}else if(val !== null && !isNaN(val)){
					filteredVals.push(parseFloat(val));
				}else{
					return EFP.Error.VALUE;
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
				if(a[x] instanceof Array){
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
		"CHIDIST": function(x,n) {
			if(!(this.isNumber(x) && this.isNumber(n))){
				return EFP.Error.VALUE;
			}

			if(x < 0){
				return EFP.Error.NUM;
			}

			if(n % 1 !== 0){
				n = Math.floor(n);
			}

			if(n < 1 || n >= this.POWER(10,10)){
				return EFP.Error.NUM;
			}

			if(x>1000 | n>1000) {
				var q=this.NORM((this.POWER(x/n,1/3)+2/(9*n)-1)/this.SQRT(2/(9*n)))/2;
				if (x>n) {
					return q;
				}else{
					return 1-q;
				}
			}

			var p=this.EXP(-0.5*x);
			if((n%2)==1) {
				p=p*this.SQRT(2*x/this.PI());
			}

			var k=n;
			while(k>=2) {
				p=p*x/k;
				k=k-2;
			}

			var t=p;
			var a=n;

			while(t>1e-15*p) {
				a=a+2;
				t=t*x/a;
				p=p+t;
			}
			return (1-p);
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
				}else if(this.isString(v) && this.isNumeric(v)){
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
						criteria = criteria.split('~*');
						for(var i = 0; i < criteria.length; i++){
							criteria[i] = criteria[i].replace(/\*/g,'.*');
						}
						criteria = criteria.join(this.escapeRegexSpecials('*'));
					}

					if(this.contains(criteria,'?')){
						containsWildcards = true;
						criteria = criteria.split('~?');
						for(var j = 0; j < criteria.length; j++){
							criteria[j] = criteria[j].replace(/\?/g,'.');
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
		"ERF": function(z,n) {
			//TODO add n (upper limit)
			return (2*this.GAUSS(this.SQRT(2)*z));
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
		"EXP": function(x) {
			return Math.exp(x);
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
			return EFP.Bool.FALSE;
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
		"GAUSS": function(z){
			//Because NORM.S.DIST(0,True) always returns 0.5, GAUSS (z) will always be 0.5 less than NORM.S.DIST(z,True).
			var g = ( (z<0) ? ( (z<-10) ? 0 : this.CHIDIST(z*z,1)/2 ) : ( (z>10) ? 1 : 1-this.CHIDIST(z*z,1)/2 ) );
			g -= 0.5;
			return g;
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
		"IF": function(condition,tVal,fVal) {
			return condition.toBool() ? tVal : fVal;
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
		"LN": function(number) {
			return Math.log(number);
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
		"LOGINV": function(probability,mean,stdev) {
			if(!(this.isNumber(probability) && this.isNumber(mean) && this.isNumber(stdev))){
				return EFP.Error.VALUE;
			}

			if(probability < 0 || probability > 1){
				return EFP.Error.NUM;
			}

			if(stdev <= 0){
				return EFP.Error.Num;
			}

			return this.POWER(Math.E,(mean+stdev*this.NORMSINV(probability)))
		},
		"LOGNORM.DIST": function() {
			throw "not implemented";
		},
		"LOGNORM.INV": function(probability,mean,stdev) {
			return this.LOGINV(probability,mean,stdev);
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
		"NORMDIST": function(x, mean, stdev, cumulative) {
			if(!this.isBool(cumulative)){
				return EFP.Error.VALUE;
			}

			if(cumulative.toBool()){
				return (1/2*(1+this.ERF((x-mean)/(stdev*this.SQRT(2)))));
			}else{
				return ((1/(this.SQRT(2*this.PI())*stdev))*this.POWER(Math.E,(-(this.POWER(x-mean,2)/(2*this.POWER(stdev,2))))));
			}
		},
		"NORMINV": function() {
			throw "not implemented";
		},
		"NORMSDIST": function(z) {
			return this.NORMDIST(z,0,1,this.TRUE());
		},
		"NORMSINV": function(p) {

			if(!this.isNumber(p)){
				return EFP.Error.VALUE;
			}

			if(p < 0 || p > 1){
				return EFP.Error.NUM;
			}

			var a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
			var a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
			var b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
			var b4 = 66.8013118877197, b5 = -13.2806815528857, c1 = -7.78489400243029E-03;
			var c2 = -0.322396458041136, c3 = -2.40075827716184, c4 = -2.54973253934373;
			var c5 = 4.37466414146497, c6 = 2.93816398269878, d1 = 7.78469570904146E-03;
			var d2 = 0.32246712907004, d3 = 2.445134137143, d4 = 3.75440866190742;
			var p_low = 0.02425, p_high = 1 - p_low;
			var q, r;
			var retVal;

			if (p < p_low){
				q = this.SQRT(-2 * Math.log(p));
				retVal = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
			} else if (p <= p_high) {
				q = p - 0.5;
				r = q * q;
				retVal = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
			} else {
				q = this.SQRT(-2 * Math.log(1 - p));
				retVal = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
			}
			return retVal;
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
			return Math.PI;
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
		"POWER": function(n,p) {
			return Math.pow(n,p);
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
		"RANDBETWEEN": function(bottom,top) {
			if(this.isRef(bottom)){
				bottom = bottom.valueOf();
			}

			if(this.isRef(top)){
				top = top.valueOf();
			}

			if(!this.isNumber(bottom) || !this.isNumber(top)){
				return Error.VALUE;
			}

			if(bottom > top) return Error.NUM;

			var rand = Math.floor(Math.random() * (top - bottom + 1)) + bottom;
			return rand;
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
		"SQRT": function(number) {
			if(number < 0){
				return EFP.Error.NUM;
			}

			return Math.sqrt(number);
		},
		"SQRTPI": function() {
			return this.SQRT(this.PI());
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
					if(this.isNumeric(a[x])){
						sum += parseFloat(a[x]);
					}
				}else if(a[x] instanceof Array){
					sum += this.SUM.apply(this,a[x]);
				}else if (!isNaN(a[x])){
					sum += parseFloat(a[x]);
				}else{
					return EFP.Error.VALUE;
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
			return EFP.Bool.TRUE;
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
			if(v === EFP.Error.NA){
				return v;
			}
			return this.ISERROR(v);
		},
		"ISERROR": function(v) {
			if(this.isError(v)){
				return EFP.Bool.TRUE;
			}
			return EFP.Bool.FALSE;
		},
		"ISLOGICAL": function() {
			if(this.isBool(v)){
				return EFP.Bool.TRUE;
			}
			return EFP.Bool.FALSE;
		},
		"ISNA": function() {
			throw "not implemented";
		},
		"ISNONTEXT": function() {
			throw "not implemented";
		},
		"ISNUMBER": function(value) {
			if(this.isNumber(value)){
				return EFP.Bool.TRUE;
			}
			return EFP.Bool.FALSE;
		},
		"ISREF": function(v) {
			if(this.isRef(v)){
				return EFP.Bool.TRUE;
			}
			return EFP.Bool.FALSE;
		},
		"ISTEXT	": function(v) {
			if(this.isString(v)){
				return EFP.Bool.TRUE;
			}
			return EFP.Bool.FALSE;
		}
	};
})();
