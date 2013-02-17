var Parser = (function() {

	function Ref(pos, value, p, pCtx) {
		var p = p;
		var pCtx = pCtx;
		this.valueOf = function() {
			if(!isNaN(this.value)) {
				return this.value;
			}
			return p.call(pCtx, this.value);
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
			this.row = parseInt(row);
			this.position = pos;
			this.columnIndex = colIndex;
		}
		this.setPosition(pos)
		this.value = value;
	}

	Ref.getColumnByIndex = function(i) {
		var start = 65; //A       
		if(i < 26) {
			return String.fromCharCode(i + start);
		} else {
			var n = (i) / 26 - 1;
			return f(n) + f(i % 26)
		}
	}

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
		LEFTPAR: 20,
		RIGHTPAR: 21,
	};

	var error = {
		NULL: "#NULL!",
		DIVZERO: "#DIV/0!",
		VALUE: "#VALUE!",
		REF: "#REF!",
		NAME: "#NAME?",
		NUM: "#NUM!",
		NA: "#N/A"
	}


	var fn = {
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
			//TODO add DIV/ZERO err
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
				Array.proto.push.apply(a, b);
				return a;
			} else if(Array.isArray(a)) {
				a.push(b);
				return a;
			} else if(Array.isArray(b)) {
				b.unshift(a);
				return b;
			}
			return [a, b];
		},
		range: function(a, b) {
			return a + ":" + b;
		}
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
			unknown: function() {
				function fnArray(a) {
					while(a.length > 0) {
						var ret = fnCall(a.pop());
						if(ret) {
							return ret;
						}
					}
					return lexer.lex.unknown;
				}

				function fnCall(fn) {
					var pos = lexer.pos;
					var ret = fn();
					var hasLexed = pos !== lexer.pos;
					if(hasLexed) {
						if(ret) {
							if(Array.isArray(ret)) {
								return fnArray(ret);
							}
							return ret;
						}
						return lexer.lex.unknown;
					}
				}

				for(var fn in lexer.lex) {
					if(fn !== 'unknown') {
						lexer.lex[fn].id = fn;
						var ret = fnCall(lexer.lex[fn]);
						if(ret) return ret;
					}
				}
				throw "Unknown input " + lexer.next();
			},
			str: function() {
				if(lexer.isNextConsume('"')) {
					if(lexer.ignoreUntil('"')) {
						lexer.emit(type.STR);
						return [
						lexer.lex.list, lexer.lex.gt, lexer.lex.eq, lexer.lex.lt, lexer.lex.concat, lexer.lex.missarg, lexer.lex.le, lexer.lex.ge, lexer.lex.ne];
					} else {
						throw "Error occured parsing string!"
					}
				}
			},
			ne: function() {
				if(lexer.isNextConsume('<>')) {
					lexer.emit(type.NE);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			ge: function() {
				if(lexer.isNextConsume('>=')) {
					lexer.emit(type.GE);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			le: function() {
				if(lexer.isNextConsume('<=')) {
					lexer.emit(type.LE);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
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
					return [lexer.lex.ref, lexer.lex.num];
				}
			},
			div: function() {
				if(lexer.isNextConsume('/')) {
					lexer.emit(type.DIV);
					return [lexer.lex.ref, lexer.lex.num];
				}
			},
			sub: function() {
				if(lexer.isNextConsume('-')) {
					lexer.emit(type.SUB);
					return [lexer.lex.ref, lexer.lex.num];
				}
			},
			add: function() {
				if(lexer.isNextConsume('+')) {
					lexer.emit(type.ADD);
					return [lexer.lex.ref, lexer.lex.num];
				}
			},
			pow: function() {
				if(lexer.isNextConsume('^')) {
					lexer.emit(type.POW);
					return [lexer.lex.ref, lexer.lex.num];
				}
			},
			concat: function() {
				if(lexer.isNextConsume('&')) {
					lexer.emit(type.CONCAT);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			lt: function() {
				if(lexer.isNextConsume('<')) {
					lexer.emit(type.LT);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			eq: function() {
				if(lexer.isNextConsume('=')) {
					lexer.emit(type.EQ);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			gt: function() {
				if(lexer.isNextConsume('>')) {
					lexer.emit(type.GT);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			isect: function() {
				if(lexer.isNextConsume(' ')) {
					lexer.emit(type.ISECT);
					return [lexer.lex.ref];
				}
			},
			list: function() {
				if(lexer.isNextConsume(',')) {
					lexer.emit(type.LIST);
					return [lexer.lex.ref, lexer.lex.num, lexer.lex.str];
				}
			},
			range: function() {
				if(lexer.isNextConsume(':')) {
					lexer.emit(type.RANGE);
					return [lexer.lex.ref];
				}
			},
			leftPar: function() {
				if(lexer.isNextConsume('(') || lexer.isNextConsume('{')) {
					lexer.emit(type.LEFTPAR);
				}
			},
			rightPar: function() {
				if(lexer.isNextConsume(')') || lexer.isNextConsume('}')) {
					lexer.emit(type.RIGHTPAR);
				}
			},
			func: function() {
				if(lexer.isNextFunc()) {
					lexer.emit(type.FUNC);
					//return lexer.lex.leftpar;
				}
			},
			num: function() {
				if(!isNaN(lexer.peek())) {
					lexer.accept("0123456789");
					lexer.accept(".0123456789");
					lexer.emit(type.NUM);
					return [
					lexer.lex.list, lexer.lex.gt, lexer.lex.eq, lexer.lex.lt, lexer.lex.concat, lexer.lex.pow, lexer.lex.add, lexer.lex.sub, lexer.lex.div, lexer.lex.mul, lexer.lex.percent, lexer.lex.missarg, lexer.lex.le, lexer.lex.ge, lexer.lex.ne];
				}
			},
			ref: function() {
				if(lexer.accept("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
					lexer.emit(type.REF);
					return [
					lexer.lex.isect, lexer.lex.range, lexer.lex.list, lexer.lex.gt, lexer.lex.eq, lexer.lex.lt, lexer.lex.concat, lexer.lex.pow, lexer.lex.add, lexer.lex.sub, lexer.lex.div, lexer.lex.mul, lexer.lex.percent, lexer.lex.missarg, lexer.lex.le, lexer.lex.ge, lexer.lex.ne];
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
			if(this.accept("ABCDEFGHIJKLMNOPQRSTUVWXYZ") && this.peek() === '(') {
				return true;
			}
			this.pos = pos;
			return false;
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
			if (index != -1){
				this.pos = index+1;
				return true;
			}
			return false;
		};

		this.newStart = function() {
			this.start = this.pos;
		};

		this.input = input;
		this.start = 0;
		this.pos = 0;
		this.tokens = [];

		var stateFn = this.lex.unknown;
		while(this.start < this.input.length && stateFn != null) {
			stateFn = stateFn();
		}

		return this.tokens
	}

	function Parser(data) {
		this.parse = function(input) {
			var parserFn = this.parse;
			var data = this.data;
			var stack = Lex(input);
			stack = convertStackFromInfixToPostfix(stack);

			var valueStack = [];

			while(stack.length > 0) {
				var item = stack.shift();
				switch(item.type) {
				case type.NUM:
					valueStack.push(fn.atoi(item.val));
					break;
				case type.STR:
					valueStack.push(item.val.slice(1, item.val.length - 1));
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
				case type.RANGE:
					//evaluateOperator(fn.range, valueStack);
					var range = [];
					var a = valueStack.shift();
					var b = valueStack.shift();
					var mincol = Math.min(a.columnIndex, b.columnIndex);
					var maxcol = Math.max(a.columnIndex, b.columnIndex);
					var minrow = Math.min(a.row, b.row);
					var maxrow = Math.max(a.row, b.row);

					for(var c = mincol; c <= maxcol; c++) {
						for(var r = minrow; r <= maxrow; r++) {
							var pos = Ref.getColumnByIndex(c) + r;
							if(data != null && pos in data) {
								var val = data[pos];
								var ref = new Ref(pos, val, parserFn, this);
								range.push(ref);
							}
						}
					}
					valueStack.push(range);
					break;
				case type.REF:
					if(data != null && item.val in data) {
						var pos = item.val
						var val = data[pos];
						var ref = new Ref(pos, val, parserFn, this);
						valueStack.push(ref);
						break;
					}
					valueStack.push(error.NAME);
					break;
				case type.FUNC:
					evaluateFunction(item.val, valueStack);
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
			case type.NUM:
			case type.STR:
			case type.REF:
				return true;
			default:
				return false;
			}
		}

		function hasHigherOrEqualPrecedence(a, b) {
			var ap = getPresedence(a);
			var bp = getPresedence(b);
			return ap >= bp;
		}

		function getPresedence(token) {
			switch(token.type) {
			case type.LIST:
			case type.LEFTPAR:
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
				return 3;
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
			var pBalance = 0;
			while(stack.length > 0) {
				var token = stack.shift();
				console.log('new token: ' + token.val);
				if(isOperand(token)) {
					newStack.push(token);
					console.log('pushing it to stack as it is an operand: ' + logStack(newStack));
				} else {
					if(token.type === type.LEFTPAR){
						operatorStack.push(token);
						pBalance++;
						console.log('pushing it to operatorStack as token is "(": ' + logStack(operatorStack));
					}else if(operatorStack.length === 0) {
						operatorStack.push(token);
						console.log('pushing it to operatorStack as stack is zero lenght: ' + logStack(operatorStack));
					} else {
						if(token.type === type.RIGHTPAR) {
							pBalance--;
							console.log('token is ")" initiating pop')
							while(operatorStack.length > 0) {
								console.log('still more elements on the stack: ' + logStack(operatorStack));
								var operator = operatorStack.pop();
								if(operator.type === type.LEFTPAR) {
									console.log('operator is "(", stopping pop')
									break;
								}
								newStack.push(operator);
								console.log('operator is "' + operator.val + '" pushing it to stack: ' + logStack(operatorStack))
							}
						} else {
							while(true) {
								if(operatorStack.length == 0) {
									break;
								}
								operator = operatorStack.pop();
								if(!hasHigherOrEqualPrecedence(operator, token) || operator.type === type.LEFTPAR) {
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
			}

			if(pBalance !== 0){
				throw "not equal amounts of open or close characters!";
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
			var result = evaluator.apply(fn, args);
			stack.push(result);
		}

		function evaluateFunction(fnName, stack) {
			if(fnName in window.fn) {
				var result = window.fn[fnName].apply(window.fn, stack.splice(-window.fn[fnName].length));
				stack.push(result);
			} else {
				throw "Unknown function " + fnName;
			}
		}

	}

	return {
		newInstance: function(data) {
			return new Parser(data);
		}
	};
})();