var Parser = (function() {
	var type = {
		EOF: -1,
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


	var lexer = {
		token: function(type, val) {
			return {
				type: type,
				val: val
			};
		},
		run: function(input, receiver) {
			this.input = input;
			this.start = 0;
			this.pos = 0;
			this.receiver = receiver;
			var stateFn = this.lex.unknown;
			while(this.start < this.input.length && stateFn != null) {
				stateFn = stateFn();
			}
			this.emit(type.EOF);
		},
		emit: function(type) {
			var rawValue = this.input.substring(this.start, this.pos);
			this.newStart();
			this.receiver(this.token(type, rawValue));
		},
		lex: {
			unknown: function() {
				function fnArray(a){
					while(a.length > 0){
						var ret = fnCall(a.pop());
						if(ret){
							return ret;
						}						
					}	
					return lexer.lex.unknown;							
				}

				function fnCall(fn){
					var pos = lexer.pos;
					var ret = fn();
					var hasLexed = pos !== lexer.pos;
					if(hasLexed) {
						if(ret){
							if(Array.isArray(ret)){
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
							lexer.lex.list,
							lexer.lex.gt,
							lexer.lex.eq,
							lexer.lex.lt,
							lexer.lex.concat,
							lexer.lex.missarg,
							lexer.lex.le,
							lexer.lex.ge,
							lexer.lex.ne
						];
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
						lexer.lex.list,
						lexer.lex.gt,
						lexer.lex.eq,
						lexer.lex.lt,
						lexer.lex.concat,
						lexer.lex.pow,
						lexer.lex.add,
						lexer.lex.sub,
						lexer.lex.div,
						lexer.lex.mul,
						lexer.lex.percent,
						lexer.lex.missarg,
						lexer.lex.le,
						lexer.lex.ge,
						lexer.lex.ne
						];
				}
			},
			ref: function() {
				if(lexer.accept("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890")) {
					lexer.emit(type.REF);
					return [
						lexer.lex.isect,
						lexer.lex.range,
						lexer.lex.list,
						lexer.lex.gt,
						lexer.lex.eq,
						lexer.lex.lt,
						lexer.lex.concat,
						lexer.lex.pow,
						lexer.lex.add,
						lexer.lex.sub,
						lexer.lex.div,
						lexer.lex.mul,
						lexer.lex.percent,
						lexer.lex.missarg,
						lexer.lex.le,
						lexer.lex.ge,
						lexer.lex.ne
						];					
				}
			},
		},
		next: function() {
			var n = this.input[this.pos];
			this.pos++
			return n;
		},
		backup: function() {
			this.pos--;
		},
		peek: function() {
			var n = this.next();
			this.backup();
			return n;
		},
		isNext: function(str) {
			return this.input.indexOf(str, this.pos) === this.pos;
		},
		isNextConsume: function(str) {
			if(this.isNext(str)) {
				this.pos += str.length;
				return true;
			}
			return false;
		},
		isNextFunc: function() {
			var pos = this.pos;
			if(this.accept("ABCDEFGHIJKLMNOPQRSTUVWXYZ") && this.peek() === '(') {
				return true;
			}
			this.pos = pos;
			return false;
		},
		accept: function(str) {
			var accepted = false;
			var n = this.next();
			while(str.indexOf(n) !== -1) {
				accepted = true;
				n = this.next();
			}
			this.backup();
			return accepted;
		},
		ignore: function(i) {
			this.pos += i;
		},
		ignoreUntil: function(str) {
			var index = this.input.indexOf(str, this.pos);
			this.ignore(index);
			return index != -1;
		},
		newStart: function() {
			this.start = this.pos;
		}
	};

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

		newStack = [];
		operatorStack = [];
		while(stack.length > 0) {
			var token = stack.shift();
			console.log('new token: ' + token.val);
			if(isOperand(token)) {
				newStack.push(token);
				console.log('pushing it to stack as it is an operand: ' + logStack(newStack));
			} else {
				if(operatorStack.length === 0 || token.type === type.LEFTPAR) {
					operatorStack.push(token);
					console.log('pushing it to operatorStack as ' + (token.type !== type.LEFTPAR ? 'stack is zero lenght' : 'token is "("') + ': ' + logStack(operatorStack));
				} else {
					if(token.type === type.RIGHTPAR) {
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
		while(operatorStack.length > 0) {
			console.log('operator has more elements, popping and pushing');
			newStack.push(operatorStack.pop());
		}
		console.log(logStack(newStack))
		return newStack;
	}

	function evaluateOperator(evaluator, stack) {
		var result = evaluator.apply(fn, stack.splice(-evaluator.length));
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

	return {
		parse: function(input) {
			var stack = [];
			var parsedInput;
			lexer.run(input, function(token) {
				if(token.type === type.EOF) {
					valueStack = [];
					stack = convertStackFromInfixToPostfix(stack);
					stack.forEach(function(t) {
						//console.log(t);
					})
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
							evaluateOperator(fn.range, valueStack);
							break;
						case type.REF:
							valueStack.push(item.val);
							break;
						case type.FUNC:
							evaluateFunction(item.val, valueStack);
							break;
						default:
							throw 'Unknown type' + JSON.stringify(item);
						}
					}

					if(valueStack.length === 1) {
						//console.log(valueStack)
						parsedInput = valueStack[0];
					} else {
						throw "Could not evaluate " + JSON.stringify(valueStack);
					}


				} else {
					stack.push(token);
				}
			});
			return parsedInput;
		}
	};
})();