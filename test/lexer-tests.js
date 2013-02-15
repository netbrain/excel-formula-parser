test( "lex tNum", function() {
  equal(Parser.parse("1"), 1);
  equal(Parser.parse("10"),10);
  equal(Parser.parse("-10"),-10);
  equal(Parser.parse("+10"),10);  
  equal(Parser.parse("1.121"),1.121);    
});


test( "lex tStr", function() {
  equal(Parser.parse('"ABC"'), "ABC");
  equal(Parser.parse('"abc"'), "abc");
  equal(Parser.parse('"2398"'), "2398");
});

test( "lex tPercent", function() {
  equal(Parser.parse("1%"), 0.01);
  equal(Parser.parse("100%"), 1);
  equal(Parser.parse("0.1%"), 0.001);
});

test( "lex tAdd", function() {
 equal(Parser.parse("10+10"), 20);
 equal(Parser.parse("10+10+10"), 30);
});


test( "lex tSub", function() {
 equal(Parser.parse("1-2"), -1);
 equal(Parser.parse("1-2-3"), -4);
});

test( "lex tMul", function() {
  equal(Parser.parse("3*2"), 6);
  equal(Parser.parse("1+3*2"), 7);  
  equal(Parser.parse("3*2+1"), 7);
});

test( "lex tDiv", function() {
  equal(Parser.parse("3/2"), 1.5);
  equal(Parser.parse("3/2+1"), 2.5);
  equal(Parser.parse("1+3/2"), 2.5);
});

test( "lex tPower", function() {
  equal(Parser.parse("3^2"), 9);
  equal(Parser.parse("3^3^3"), 19683);
  equal(Parser.parse("3^(3^3)"), 7625597484987);
});

test( "lex tConcat", function() {
  equal(Parser.parse('"ABC"&"DEF"'), "ABCDEF");
  equal(Parser.parse('8&"DEF"'), "8DEF");
  equal(Parser.parse('8&9'), "89");
});

test( "lex tLT", function() {
  equal(Parser.parse('2<4'), true);
  equal(Parser.parse('4<2'), false);
});

test( "lex tLE", function() {
  equal(Parser.parse('2<=4'), true);
  equal(Parser.parse('4<=2'), false);
  equal(Parser.parse('3<=3'), true);
});

test( "lex tEQ", function() {
  equal(Parser.parse('2=4'), false);
  equal(Parser.parse('4=2'), false);
  equal(Parser.parse('3=3'), true);
});

test( "lex tGE", function() {
  equal(Parser.parse('2>=4'), false);
  equal(Parser.parse('4>=2'), true);
  equal(Parser.parse('3>=3'), true);
});

test( "lex tGT", function() {
  equal(Parser.parse('2>4'), false);
  equal(Parser.parse('4>2'), true);
});

test( "lex tNE", function() {
  equal(Parser.parse('2<>4'), true);
  equal(Parser.parse('4<>2'), true);
  equal(Parser.parse('3<>3'), false);
});

test( "lex tRef", function() {
  equal(Parser.parse('A1'), "A1");
});


test( "lex tRange", function() {
  equal(Parser.parse('A1:A2'), "A1:A2");
});


test( "lex tIsect", function() {
  //TODO implement isect
  //equal(Parser.parse('A1:B3 B2:C3'), "B2:B3");
  ok(true);
});

test( "lex tList", function() {
  deepEqual(Parser.parse('1,2'), [1,2]);
  deepEqual(Parser.parse('1,2,3'), [1,2,3]);
});

test( "lex parenthesis", function() {
  equal(Parser.parse('(1+2)'), 3);
  equal(Parser.parse('2*(1+2)'), 6);
  equal(Parser.parse('2*(1+2)^2'), 18);
  equal(Parser.parse('2^(2^2)'), 16);
});

test( "lex tFunc", function() {
  equal(Parser.parse('SUM(1,2)'), 3);
  equal(Parser.parse('SUM(1,2,3)'), 6);
});

test( "lex tMissingArg", function() {
  equal(Parser.parse('SUM(1,,2)'),3);
  equal(Parser.parse('SUM(1,,,2)'),3);
});

test( "lex tArray", function() {
  equal(Parser.parse('SUM({1,2})'),3);
  equal(Parser.parse('SUM({1,2,3})'),6);
  equal(Parser.parse('SUM({1,,3})'),4);
});
test( "SUM",function(){
  //TODO equal(Parser.parse('SUM( A1:A5 )'),35);
  equal(Parser.parse('SUM(5+6,7,8,9)'),35);
  //TODO equal(Parser.parse('SUM(A1:A3,8,9'),35);
  //TODO equal(Parser.parse('SUM(A1,A2,A3,"8","9"'),35);
  equal(Parser.parse('SUM({5,6,7},8,9)'),35);
});
