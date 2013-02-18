var p;

QUnit.testStart = function (name) {
  p = Parser.newInstance();
};

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
});

test( "lex tLT", function() {
  equal(p.parse('2<4'), true);
  equal(p.parse('4<2'), false);
});

test( "lex tLE", function() {
  equal(p.parse('2<=4'), true);
  equal(p.parse('4<=2'), false);
  equal(p.parse('3<=3'), true);
});

test( "lex tEQ", function() {
  equal(p.parse('2=4'), false);
  equal(p.parse('4=2'), false);
  equal(p.parse('3=3'), true);
});

test( "lex tGE", function() {
  equal(p.parse('2>=4'), false);
  equal(p.parse('4>=2'), true);
  equal(p.parse('3>=3'), true);
});

test( "lex tGT", function() {
  equal(p.parse('2>4'), false);
  equal(p.parse('4>2'), true);
});

test( "lex tNE", function() {
  equal(p.parse('2<>4'), true);
  equal(p.parse('4<>2'), true);
  equal(p.parse('3<>3'), false);
});

test( "lex tRef", function() {
  p.setData({
    A1:1,
    B1:2,
    C1:'"STRING"',
    D1:'SUM(1,2)',
    E1:'SUM(A1,B1)',
  });
  equal(p.parse('A1'), 1);
  equal(p.parse('B1'), 2);  
  equal(p.parse('C1'), "STRING");  
  equal(p.parse('D1'), 3);  
  equal(p.parse('E1'), 3);  
  equal(p.parse('E3'), "#NAME?");  
});


test( "lex tRange", function() {
    p.setData({
    A1:1,
    A2:2,
  });
  var range = p.parse('A1:A2');
  ok(Array.isArray(range));
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
});

test( "lex tBool", function() {
  equal(p.parse('TRUE'),true);
  equal(p.parse('FALSE'),false);
});

test("ISNUMBER",function(){
  p.setData({
    A1:23.8,
    A2:-23.8,
    A3:0,
    A4:'"string"',
  });
  ok(p.parse('ISNUMBER(A1)'));
  ok(p.parse('ISNUMBER(A2)'));
  ok(p.parse('ISNUMBER(A3)'));
  ok(!p.parse('ISNUMBER(A4)'));
  ok(p.parse('ISNUMBER(5)'));
  ok(!p.parse('ISNUMBER("5")'));  
})

test( "SUM",function(){
  p.setData({
    A1:5,
    A2:6,
    A3:7,
    A4:8,
    A5:9,
    A6:'"NaN"'
  });
  equal(p.parse('SUM(A1:A5)'),35);
  equal(p.parse('SUM(5+6,7,8,9)'),35);
  equal(p.parse('SUM(A1:A3,8,9)'),35);
  equal(p.parse('SUM(A1,A2,A3,"8","9")'),35);
  equal(p.parse('SUM({5,6,7},8,9)'),35);
  equal(p.parse('SUM(TRUE,FALSE,TRUE)'),2);
  equal(p.parse('SUM(1,1/0)'),Parser.Error.DIVZERO);
  equal(p.parse('SUM(A6,1)'),Parser.Error.VALUE);

});

test("ISREF",function(){
  p.setData({
    A1:23.8,
    A2:-23.8,
    A3:0,
    A4:'"string"',
  });
  ok(p.parse('ISREF(A1)'));
  ok(p.parse('ISREF(A2)'));
  ok(p.parse('ISREF(A3)'));
  ok(p.parse('ISREF(A4)'));
  ok(!p.parse('ISREF(5)'));
  ok(!p.parse('ISREF("5")'));  
})

test("ISERR",function(){
  var fn = Parser.fn;
  var err = Parser.Error;
  var t = Parser.Bool.TRUE;
  var f = Parser.Bool.FALSE;

  equal(fn.ISERR(err.NULL),t);
  equal(fn.ISERR(err.DIVZERO),t);
  equal(fn.ISERR(err.VALUE),t);
  equal(fn.ISERR(err.REF),t);
  equal(fn.ISERR(err.NAME),t);
  equal(fn.ISERR(err.NUM),t);
  equal(fn.ISERR(1),f);
  equal(fn.ISERR("ABC"),f);
  equal(fn.ISERR(err.NA),err.NA);
})


test("ISERROR",function(){
  var fn = Parser.fn;
  var err = Parser.Error;
  var t = Parser.Bool.TRUE;
  var f = Parser.Bool.FALSE;

  equal(fn.ISERROR(err.NULL),t);
  equal(fn.ISERROR(err.DIVZERO),t);
  equal(fn.ISERROR(err.VALUE),t);
  equal(fn.ISERROR(err.REF),t);
  equal(fn.ISERROR(err.NAME),t);
  equal(fn.ISERROR(err.NUM),t);
  equal(fn.ISERROR(1),f);
  equal(fn.ISERROR("ABC"),f);
  equal(fn.ISERROR(err.NA),t);
})
