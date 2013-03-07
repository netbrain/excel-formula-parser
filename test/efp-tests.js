var p;
var TRUE = Parser.Bool.TRUE;
var FALSE = Parser.Bool.FALSE;  

QUnit.testStart = function (name) {
  p = Parser.newInstance();
};

test( "lex whitespace", function() {
  equal(p.parse('2* 3'), 6);
  equal(p.parse('2 * 3'), 6);
  equal(p.parse('"2* 3"'), '2* 3');
  equal(p.parse('"2 * 3"'), '2 * 3');
  equal(p.parse('=COUNT(1, 2,3 )'), 3);
  equal(p.parse('=COUNT( "1", " 2 ", "  3  " )'), 3);
  equal(p.parse('=COUNT( "2 * 3", 2 * 3, "  2  *  3  " )'), 1);
});


test( "lex tNum", function() {
  equal(p.parse("1"), 1);
  equal(p.parse("10"),10);
  equal(p.parse("-10"),-10);
  equal(p.parse("+10"),10);  
  equal(p.parse("1.121"),1.121);    
});


test( "lex tStr", function() {
  equal(p.parse('"ABC"'), "ABC");
  equal(p.parse('"abc"'), "abc");
  equal(p.parse('"2398"'), "2398");
});

test( "lex tPercent", function() {
  equal(p.parse("1%"), 0.01);
  equal(p.parse("100%"), 1);
  equal(p.parse("0.1%"), 0.001);
});

test( "lex tAdd", function() {
 equal(p.parse("10+10"), 20);
 equal(p.parse("10+10+10"), 30);
});


test( "lex tSub", function() {
 equal(p.parse("1-2"), -1);
 equal(p.parse("1-2-3"), -4);
});

test( "lex tMul", function() {
  equal(p.parse("3*2"), 6);
  equal(p.parse("1+3*2"), 7);  
  equal(p.parse("3*2+1"), 7);
});

test( "lex tDiv", function() {
  equal(p.parse("3/2"), 1.5);
  equal(p.parse("3/2+1"), 2.5);
  equal(p.parse("1+3/2"), 2.5);
  equal(p.parse("1/0"), "#DIV/0!");
});

test( "lex tPower", function() {
  equal(p.parse("3^2"), 9);
  equal(p.parse("3^3^3"), 19683);
  equal(p.parse("3^(3^3)"), 7625597484987);
});

test( "lex tConcat", function() {
  equal(p.parse('"ABC"&"DEF"'), "ABCDEF");
  equal(p.parse('8&"DEF"'), "8DEF");
  equal(p.parse('8&9'), "89");
  deepEqual(p.parse('&'), Parser.Error.VALUE);
  deepEqual(p.parse('1&'), Parser.Error.VALUE);
  deepEqual(p.parse('&1'), Parser.Error.VALUE);
  equal(p.parse('SUM(1,2)&3'), "33");
  deepEqual(p.parse('A1&3'), "3"); 
});

test( "lex tLT", function() {
  deepEqual(p.parse('2<4'), TRUE);
  deepEqual(p.parse('4<2'), FALSE);
  deepEqual(p.parse('<'), Parser.Error.VALUE);
  deepEqual(p.parse('1<'), Parser.Error.VALUE);
  deepEqual(p.parse('<1'), Parser.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)<3'), FALSE);
  deepEqual(p.parse('A1<3'), TRUE);  
});

test( "lex tLE", function() {
  deepEqual(p.parse('2<=4'), TRUE);
  deepEqual(p.parse('4<=2'), FALSE);
  deepEqual(p.parse('3<=3'), TRUE);
  deepEqual(p.parse('<='), Parser.Error.VALUE);
  deepEqual(p.parse('1<='), Parser.Error.VALUE);
  deepEqual(p.parse('<=1'), Parser.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)<=3'), TRUE);
  deepEqual(p.parse('A1<=3'), TRUE);    
});

test( "lex tEQ", function() {
  deepEqual(p.parse('2=4'), FALSE);
  deepEqual(p.parse('4=2'), FALSE);
  deepEqual(p.parse('3=3'), TRUE);
  deepEqual(p.parse('=='), Parser.Error.VALUE);
  deepEqual(p.parse('=1='), Parser.Error.VALUE);
  deepEqual(p.parse('==1'), Parser.Error.VALUE);
  deepEqual(p.parse('=SUM(1,2)=3'), TRUE);
  deepEqual(p.parse('=A1=3'), FALSE);
});

test( "lex tGE", function() {
  deepEqual(p.parse('2>=4'), FALSE);
  deepEqual(p.parse('4>=2'), TRUE);
  deepEqual(p.parse('3>=3'), TRUE);
  deepEqual(p.parse('>='), Parser.Error.VALUE);
  deepEqual(p.parse('1>='), Parser.Error.VALUE);
  deepEqual(p.parse('>=1'), Parser.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)>=3'), TRUE);
  deepEqual(p.parse('A1>=3'), FALSE);  
});

test( "lex tGT", function() {
  deepEqual(p.parse('2>4'), FALSE);
  deepEqual(p.parse('4>2'), TRUE);
  deepEqual(p.parse('>'), Parser.Error.VALUE);
  deepEqual(p.parse('1>'), Parser.Error.VALUE);
  deepEqual(p.parse('>1'), Parser.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)>3'), FALSE);
  deepEqual(p.parse('A1>3'), FALSE);  
});

test( "lex tNE", function() {
  deepEqual(p.parse('2<>4'), TRUE);
  deepEqual(p.parse('4<>2'), TRUE);
  deepEqual(p.parse('3<>3'), FALSE);
  deepEqual(p.parse('<>'), Parser.Error.VALUE);
  deepEqual(p.parse('1<>'), Parser.Error.VALUE);
  deepEqual(p.parse('<>1'), Parser.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)<>3'), FALSE);
  deepEqual(p.parse('A1<>3'), TRUE);    
});

test( "lex tRef", function() {
  p.setData({
    A1:1,
    B1:2,
    C1:'"STRING"',
    D1:'SUM(1,2)',
    E1:'SUM(A1,B1)',
  });
  deepEqual(p.parse('A1').valueOf(), 1);
  deepEqual(p.parse('B1').valueOf(), 2);  
  deepEqual(p.parse('C1').valueOf(), "STRING");  
  deepEqual(p.parse('D1').valueOf(), 3);  
  deepEqual(p.parse('E1').valueOf(), 3);  
  deepEqual(p.parse('E3').valueOf(), '');
});


test( "lex tRange", function() {
    p.setData({
    A1:1,
    A2:2,
  });
  var result = p.parse('A1:A2');
  var range = result[0];
  ok(Array.isArray(range));
  ok(range.isRange);
  ok(range.length === 2);

  for (var x = 0; x < range.length; x++){
      range[x] = range[x].valueOf();
  }
  deepEqual( range, [1,2]);


});


test( "lex tIsect", function() {
  //TODO implement isect
  //equal(p.parse('A1:B3 B2:C3'), "B2:B3");
  ok(true);
});

test( "lex tList", function() {
  deepEqual(p.parse('1,2'), [1,2]);
  deepEqual(p.parse('1,2,3'), [1,2,3]);
});

test( "lex parenthesis", function() {
  equal(p.parse('(1+2)'), 3);
  equal(p.parse('2*(1+2)'), 6);
  equal(p.parse('2*(1+2)^2'), 18);
  equal(p.parse('2^(2^2)'), 16);
});

test( "lex tFunc", function() {
  equal(p.parse('SUM(1,2)'), 3);
  equal(p.parse('SUM(1,2,3)'), 6);
});

test( "lex tMissingArg", function() {
  deepEqual(p.parse('1,,2'),[1,undefined,2]);
  deepEqual(p.parse('1,,,2'),[1,undefined,undefined,2]);
});

test( "lex tArray", function() {
  deepEqual(p.parse('{1,2}'),[1,2]);
  deepEqual(p.parse('{1,2,3}'),[1,2,3]);
  deepEqual(p.parse('{1,,3}'),[1,undefined,3]);
  equal(p.parse('{1,2}').isArray,true);
});

test( "lex tBool", function() {
  deepEqual(p.parse('TRUE'),TRUE);
  deepEqual(p.parse('FALSE'),FALSE);
});

test("ISNUMBER",function(){
  p.setData({
    A1:23.8,
    A2:-23.8,
    A3:0,
    A4:'"string"',
  });
  deepEqual(p.parse('ISNUMBER(A1)'),TRUE);
  deepEqual(p.parse('ISNUMBER(A2)'),TRUE);
  deepEqual(p.parse('ISNUMBER(A3)'),TRUE);
  deepEqual(p.parse('ISNUMBER(A4)'),FALSE);
  deepEqual(p.parse('ISNUMBER(5)'),TRUE);
  deepEqual(p.parse('ISNUMBER("5")'),FALSE);  
})

test( "SUM",function(){
  p.setData({
    A1:5,
    A2:6,
    A3:7,
    A4:8,
    A5:9,
    A6:'"NaN"',
    A7:'TRUE',
    A8:null
  });
  equal(p.parse('SUM()'),0);
  equal(p.parse('SUM(A1:A5)'),35);
  equal(p.parse('SUM(5+6,7,8,9)'),35);
  equal(p.parse('SUM(A1:A3,8,9)'),35);
  equal(p.parse('SUM(A1,A2,A3,"8","9")'),35);
  equal(p.parse('SUM({5,6,7},8,9)'),35);
  equal(p.parse('SUM(TRUE,FALSE,TRUE)'),2);
  deepEqual(p.parse('SUM(1,1/0)'),Parser.Error.DIVZERO);
  deepEqual(p.parse('SUM("NaN",1)'),Parser.Error.VALUE);
  equal(p.parse('SUM(A6,A7,2)'),3);
  equal(p.parse('SUM(A8)'),0);

});

test("ISREF",function(){
  p.setData({
    A1:23.8,
    A2:-23.8,
    A3:0,
    A4:'"string"',
  });
  deepEqual(p.parse('ISREF(A1)'),TRUE);
  deepEqual(p.parse('ISREF(A2)'),TRUE);
  deepEqual(p.parse('ISREF(A3)'),TRUE);
  deepEqual(p.parse('ISREF(A4)'),TRUE);
  deepEqual(p.parse('ISREF(5)'),FALSE);
  deepEqual(p.parse('ISREF("5")'),FALSE);  
})

test("ISERR",function(){
  var fn = Parser.fn;
  var err = Parser.Error;

  deepEqual(fn.ISERR(err.NULL),TRUE);
  deepEqual(fn.ISERR(err.DIVZERO),TRUE);
  deepEqual(fn.ISERR(err.VALUE),TRUE);
  deepEqual(fn.ISERR(err.REF),TRUE);
  deepEqual(fn.ISERR(err.NAME),TRUE);
  deepEqual(fn.ISERR(err.NUM),TRUE);
  deepEqual(fn.ISERR(1),FALSE);
  deepEqual(fn.ISERR("ABC"),FALSE);
  deepEqual(fn.ISERR(err.NA),err.NA);
})


test("ISERROR",function(){
  var fn = Parser.fn;
  var err = Parser.Error;

  deepEqual(fn.ISERROR(err.NULL),TRUE);
  deepEqual(fn.ISERROR(err.DIVZERO),TRUE);
  deepEqual(fn.ISERROR(err.VALUE),TRUE);
  deepEqual(fn.ISERROR(err.REF),TRUE);
  deepEqual(fn.ISERROR(err.NAME),TRUE);
  deepEqual(fn.ISERROR(err.NUM),TRUE);
  deepEqual(fn.ISERROR(1),FALSE);
  deepEqual(fn.ISERROR("ABC"),FALSE);
  deepEqual(fn.ISERROR(err.NA),TRUE);
})

test("AVERAGE",function(){
  p.setData({
    A1:8,
    A2:7,
    A3:9,
    A4:6,
    A5:10,
    A6:null,
  });
  equal(p.parse('AVERAGE(A1:A5)'),8);
  equal(p.parse('AVERAGE(8,7,9,6,10)'),8);
  equal(p.parse('AVERAGE(A1,A2,A3,A4,A5)'),8);
  equal(p.parse('AVERAGE(A1:A3,{6,10})'),8);
  equal(p.parse('AVERAGE(TRUE,FALSE,TRUE)'),2/3);
  deepEqual(p.parse('AVERAGE("TEXT",1)'),Parser.Error.VALUE);
  equal(p.parse('AVERAGE(A6,1)'),1);
})


test("COUNTIF",function(){
  p.setData({
    A2:'"apples"',
    A3:'"oranges"',
    A4:'"peaches"',
    A5:'"apples"',
    B2:32,
    B3:54,
    B4:75,
    B5:86,
    B6:"TRUE",
    B7:"FALSE",
    B8:"FALSE",
    C2:'"?A?B?C"',
    C3:'"***ABC"',
    C4:'"ABC"'
  });

  equal(p.parse('COUNTIF(A2:A5,"apples")'),2);
  equal(p.parse('COUNTIF(A2:A5,A4)'),1);
  equal(p.parse('COUNTIF(A2:A5,A3)'),1);
  equal(p.parse('COUNTIF(A2:A5,A2)'),2);
  equal(p.parse('COUNTIF(A2:A5,A3)+COUNTIF(A2:A5,A2)'),3);
  equal(p.parse('COUNTIF(B2:B5,">55")'),2);
  equal(p.parse('COUNTIF(B2:B5,"<>"&B4)'),3);
  equal(p.parse('COUNTIF(B2:B5,">=32")'),4);
  equal(p.parse('COUNTIF(B2:B5,">85")'),1);
  equal(p.parse('COUNTIF(B2:B5,">=32")-COUNTIF(B2:B5,">85")'),3);
  equal(p.parse('COUNTIF(B2:B5,"<=32")'),1);
  equal(p.parse('COUNTIF(B2:B5,"<54")'),1);
  equal(p.parse('COUNTIF(B2:B8,TRUE)'),1);
  equal(p.parse('COUNTIF(B2:B8,FALSE)'),2);
  equal(p.parse('COUNTIF(A2:A5,"*es")'),4);
  equal(p.parse('COUNTIF(A2:A5,"a???es")'),2)
  equal(p.parse('COUNTIF(C2:C4,"~?A~?B~?C")'),1);
  equal(p.parse('COUNTIF(C2:C4,"~*~*~*ABC")'),1);
  equal(p.parse('COUNTIF(C2:C4,"<>ABC")'),2);

})

test("COUNT",function(){
  p.setData({
    A1:1,
    A2:40209, //date 31 january 2012
    A3:'TRUE',
    A4:'"1"',
    A5:'"Text"',
    A6:'SUM(1/0)', //error
    A7:'A1+A2'
  });

  equal(p.parse('COUNT(A1:A7)'),3);
  equal(p.parse('COUNT(1,40209,TRUE,"1","40209","Text",1/0)'),5);

})


test("PERCENTILE",function(){
  p.setData({
    A1:2,
    A2:1,
    A3:6,
    A4:4,
    A5:3,
    A6:5,
  });

  equal(p.parse('PERCENTILE(A1:A6,0.2)'),2);
  equal(p.parse('PERCENTILE(A1:A6,60%)'),4);
  equal(p.parse('PERCENTILE(A1:A6,50%)'),3.5);
  deepEqual(p.parse('PERCENTILE(A1:A6,2)'),Error.NUM);
  deepEqual(p.parse('PERCENTILE(A1:A6,"text")'),Error.VALUE);

})

test("RANDBETWEEN",function(){
  p.setData({
    A1:1,
    A2:10,
  });

  var rand;
  rand = p.parse('RANDBETWEEN(1,10)');
  ok(rand >= 1 && rand <= 10);
  rand = p.parse('RANDBETWEEN(A1,A2)');
  ok(rand >= 1 && rand <= 10);
  rand = p.parse('RANDBETWEEN(A2-A1,SUM(A1,A2))');
  ok(rand >= 9 && rand <= 11);

})
