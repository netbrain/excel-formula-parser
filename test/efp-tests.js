var p;

QUnit.testStart = function (name) {
  ok(EFP !== undefined);
  p = EFP.newInstance();
};

test( "bootstrap", function() {
  ok(p !== undefined);
});

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
  p.setData({
    "A1":1,
    "A2":2
  });

 equal(p.parse("10+10"), 20);
 equal(p.parse("10+10+10"), 30);
 equal(p.parse("A1+A2"),3);
});


test( "lex tSub", function() {
  p.setData({
    "A1":1,
    "A2":2
  });

 equal(p.parse("1-2"), -1);
 equal(p.parse("1-2-3"), -4);
 equal(p.parse("A1-A2"),-1);
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
  equal(p.parse("3^2/2"),4.5);
});

test( "lex tConcat", function() {
  p.setData({
    A1: 0
  });

  equal(p.parse('"ABC"&"DEF"'), "ABCDEF");
  equal(p.parse('8&"DEF"'), "8DEF");
  equal(p.parse('8&9'), "89");
  deepEqual(p.parse('&'), EFP.Error.VALUE);
  deepEqual(p.parse('1&'), EFP.Error.VALUE);
  deepEqual(p.parse('&1'), EFP.Error.VALUE);
  equal(p.parse('SUM(1,2)&3'), "33");
  deepEqual(p.parse('B1&3'), "3");
  equal(p.parse('"<" & A1'),'<0');
});
test( "lex tLT", function() {
  deepEqual(p.parse('2<4').toBool(), true);
  deepEqual(p.parse('4<2').toBool(), false);
  deepEqual(p.parse('<'), EFP.Error.VALUE);
  deepEqual(p.parse('1<'), EFP.Error.VALUE);
  deepEqual(p.parse('<1'), EFP.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)<3').toBool(), false);
  deepEqual(p.parse('A1<3').toBool(), true);
});
test( "lex tLE", function() {
  deepEqual(p.parse('2<=4').toBool(), true);
  deepEqual(p.parse('4<=2').toBool(), false);
  deepEqual(p.parse('3<=3').toBool(), true);
  deepEqual(p.parse('<='), EFP.Error.VALUE);
  deepEqual(p.parse('1<='), EFP.Error.VALUE);
  deepEqual(p.parse('<=1'), EFP.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)<=3').toBool(), true);
  deepEqual(p.parse('A1<=3').toBool(), true);
});

test( "lex tEQ", function() {
  p.setData({
    A1:3
  });
  deepEqual(p.parse('2=4').toBool(), false);
  deepEqual(p.parse('4=2').toBool(), false);
  deepEqual(p.parse('3=3').toBool(), true);
  deepEqual(p.parse('=='), EFP.Error.VALUE);
  deepEqual(p.parse('=1='), EFP.Error.VALUE);
  deepEqual(p.parse('==1'), EFP.Error.VALUE);
  deepEqual(p.parse('=SUM(1,2)=3').toBool(), true);
  equal(p.parse('=A1=3').toBool(), true);
  equal(p.parse('=A1=2').toBool(), false);
  deepEqual(p.parse('=A2=0').toBool(),true);
  deepEqual(p.parse('=A2=""').toBool(),true);
});

test( "lex tGE", function() {
  deepEqual(p.parse('2>=4').toBool(), false);
  deepEqual(p.parse('4>=2').toBool(), true);
  deepEqual(p.parse('3>=3').toBool(), true);
  deepEqual(p.parse('>='), EFP.Error.VALUE);
  deepEqual(p.parse('1>='), EFP.Error.VALUE);
  deepEqual(p.parse('>=1'), EFP.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)>=3').toBool(), true);
  deepEqual(p.parse('A1>=3').toBool(), false);
});

test( "lex tGT", function() {
  deepEqual(p.parse('2>4').toBool(), false);
  deepEqual(p.parse('4>2').toBool(), true);
  deepEqual(p.parse('>'), EFP.Error.VALUE);
  deepEqual(p.parse('1>'), EFP.Error.VALUE);
  deepEqual(p.parse('>1'), EFP.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)>3').toBool(), false);
  deepEqual(p.parse('A1>3').toBool(), false);
});

test( "lex tNE", function() {
  deepEqual(p.parse('2<>4').toBool(), true);
  deepEqual(p.parse('4<>2').toBool(), true);
  deepEqual(p.parse('3<>3').toBool(), false);
  deepEqual(p.parse('<>'), EFP.Error.VALUE);
  deepEqual(p.parse('1<>'), EFP.Error.VALUE);
  deepEqual(p.parse('<>1'), EFP.Error.VALUE);
  deepEqual(p.parse('SUM(1,2)<>3').toBool(), false);
  deepEqual(p.parse('A1<>3').toBool(), true);
  deepEqual(p.parse('A1<>0').toBool(),false);
  deepEqual(p.parse('A1<>""').toBool(),false);
});

test( "lex tRef", function() {
  p.setData({
    A1:1,
    B1:2,
    C1:'"STRING"',
    D1:'SUM(1,2)',
    E1:'SUM(A1,B1)'
  });
  deepEqual(p.parse('A1').valueOf(), 1);
  deepEqual(p.parse('B1').valueOf(), 2);
  deepEqual(p.parse('C1').valueOf(), "STRING");
  deepEqual(p.parse('D1').valueOf(), 3);
  deepEqual(p.parse('E1').valueOf(), 3);
  deepEqual(p.parse('E3').valueOf(), null); // blank cell should yield 0 when referenced to
  deepEqual(p.parse('$A$1').valueOf(), 1);
});


test( "lex tRange", function() {
    p.setData({
    A1:1,
    A2:2
  });
  var result = p.parse('A1:A2');
  var range = result[0];
  ok(range instanceof Array);
  ok(range.isRange);
  ok(range.length === 2);

  for (var x = 0; x < range.length; x++){
      range[x] = range[x].valueOf();
  }
  deepEqual( range, [1,2]);


});

test( "lex tRange special case A:A", function() {
    p.setData({
    A1:1,
    A2:2
  });
  var result = p.parse('A:A');
  var range = result[0];
  ok(range instanceof Array);
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
  deepEqual(p.parse('TRUE').toBool(),true);
  deepEqual(p.parse('FALSE').toBool(),false);
});

test("isNumeric test",function(){
  ok(!EFP.fn.isNumeric(p.parse('""')));
  ok(EFP.fn.isNumeric(p.parse('"1"')));
  ok(EFP.fn.isNumeric(p.parse('"   1.12039  "')));
  ok(!EFP.fn.isNumeric(p.parse('"   1.12039 abc "')));
  ok(!EFP.fn.isNumeric(null));
  ok(!EFP.fn.isNumeric(EFP.Bool.TRUE));
  ok(!EFP.fn.isNumeric(EFP.Bool.FALSE));
  ok(!EFP.fn.isNumeric(EFP.Error.VALUE));

  var obj = {
    valueOf: function(){
      return '';
    }
  };
  ok(!EFP.fn.isNumeric(obj));

});

test("ISNUMBER",function(){
  p.setData({
    A1:23.8,
    A2:-23.8,
    A3:0,
    A4:'"string"'
  });
  deepEqual(p.parse('ISNUMBER(A1)').toBool(),true);
  deepEqual(p.parse('ISNUMBER(A2)').toBool(),true);
  deepEqual(p.parse('ISNUMBER(A3)').toBool(),true);
  deepEqual(p.parse('ISNUMBER(A4)').toBool(),false);
  deepEqual(p.parse('ISNUMBER(5)').toBool(),true);
  deepEqual(p.parse('ISNUMBER("5")').toBool(),false);
});

test( "SUM",function(){
  p.setData({
    A1:5,
    A2:6,
    A3:7,
    A4:8,
    A5:9,
    A6:'"NaN"',
    A7:'TRUE',
    A8:1,
    A9:'1',
    A10:'',
    CH10:1,
    CH20:1
  });
  equal(p.parse('SUM()'),0);
  equal(p.parse('SUM(A1:A5)'),35);
  equal(p.parse('SUM(5+6,7,8,9)'),35);
  equal(p.parse('SUM(A1:A3,8,9)'),35);
  equal(p.parse('SUM(A1,A2,A3,"8","9")'),35);
  equal(p.parse('SUM({5,6,7},8,9)'),35);
  equal(p.parse('SUM(TRUE,FALSE,TRUE)'),2);
  deepEqual(p.parse('SUM(1,1/0)'),EFP.Error.DIVZERO);
  deepEqual(p.parse('SUM("NaN",1)'),EFP.Error.VALUE);
  equal(p.parse('SUM(A6,A7,2)'),3);
  equal(p.parse('SUM(B1)'),0);
  equal(p.parse('SUM(A8:B8)'),1);
  equal(p.parse('SUM(A9:B9)'),1);
  equal(p.parse('SUM(A9:A10)'),1);
  equal(p.parse('SUM(CH10:CH20)'),2);

});

test("ISREF",function(){
  p.setData({
    A1:23.8,
    A2:-23.8,
    A3:0,
    A4:'"string"'
  });
  deepEqual(p.parse('ISREF(A1)').toBool(),true);
  deepEqual(p.parse('ISREF(A2)').toBool(),true);
  deepEqual(p.parse('ISREF(A3)').toBool(),true);
  deepEqual(p.parse('ISREF(A4)').toBool(),true);
  deepEqual(p.parse('ISREF(5)').toBool(),false);
  deepEqual(p.parse('ISREF("5")').toBool(),false);
});

test("ISERR",function(){
  var fn = EFP.fn;
  var err = EFP.Error;

  deepEqual(fn.ISERR(err.NULL).toBool(),true);
  deepEqual(fn.ISERR(err.DIVZERO).toBool(),true);
  deepEqual(fn.ISERR(err.VALUE).toBool(),true);
  deepEqual(fn.ISERR(err.REF).toBool(),true);
  deepEqual(fn.ISERR(err.NAME).toBool(),true);
  deepEqual(fn.ISERR(err.NUM).toBool(),true);
  deepEqual(fn.ISERR(1).toBool(),false);
  deepEqual(fn.ISERR("ABC").toBool(),false);
  deepEqual(fn.ISERR(err.NA),err.NA);
});


test("ISERROR",function(){
  var fn = EFP.fn;
  var err = EFP.Error;

  deepEqual(fn.ISERROR(err.NULL).toBool(),true);
  deepEqual(fn.ISERROR(err.DIVZERO).toBool(),true);
  deepEqual(fn.ISERROR(err.VALUE).toBool(),true);
  deepEqual(fn.ISERROR(err.REF).toBool(),true);
  deepEqual(fn.ISERROR(err.NAME).toBool(),true);
  deepEqual(fn.ISERROR(err.NUM).toBool(),true);
  deepEqual(fn.ISERROR(1).toBool(),false);
  deepEqual(fn.ISERROR("ABC").toBool(),false);
  deepEqual(fn.ISERROR(err.NA).toBool(),true);
});

test("AVERAGE",function(){
  p.setData({
    A1:8,
    A2:7,
    A3:9,
    A4:6,
    A5:10,
    A6:null
  });
  equal(p.parse('AVERAGE(A1:A5)'),8);
  equal(p.parse('AVERAGE(8,7,9,6,10)'),8);
  equal(p.parse('AVERAGE(A1,A2,A3,A4,A5)'),8);
  equal(p.parse('AVERAGE(A1:A3,{6,10})'),8);
  equal(p.parse('AVERAGE(TRUE,FALSE,TRUE)'),2/3);
  deepEqual(p.parse('AVERAGE("TEXT",1)'),EFP.Error.VALUE);
  equal(p.parse('AVERAGE(A6,1)'),1);
});


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
  equal(p.parse('COUNTIF(A2:A5,"a???es")'),2);
  equal(p.parse('COUNTIF(C2:C4,"~?A~?B~?C")'),1);
  equal(p.parse('COUNTIF(C2:C4,"~*~*~*ABC")'),1);
  equal(p.parse('COUNTIF(C2:C4,"<>ABC")'),2);

});

test("COUNT",function(){
  p.setData({
    A1:1,
    A2:40209, //date 31 january 2012
    A3:'TRUE',
    A4:'"1"',
    A5:'"Text"',
    A6:'1/0', //error
    A7:'=A1+A2'
  });

  equal(p.parse('COUNT(A1:A7)'),3);
  equal(p.parse('COUNT(1,40209,TRUE,"1","40209","Text",1/0)'),5);

});


test("PERCENTILE",function(){
  p.setData({
    A1:2,
    A2:1,
    A3:6,
    A4:4,
    A5:3,
    A6:5
  });

  equal(p.parse('PERCENTILE(A1:A6,0.2)'),2);
  equal(p.parse('PERCENTILE(A1:A6,60%)'),4);
  equal(p.parse('PERCENTILE(A1:A6,50%)'),3.5);
  deepEqual(p.parse('PERCENTILE(A1:A6,2)'),EFP.Error.NUM);
  deepEqual(p.parse('PERCENTILE(A1:A6,"text")'),EFP.Error.VALUE);
  equal(p.parse('PERCENTILE(A:A,0.2)'),2);

});

test("PERCENTILE.INC",function(){
  p.setData({
    A1:0,
    A2:1,
    A3:2,
    A4:3,
    A5:4,
    A6:5
  });

  equal(p.parse('PERCENTILE(A1:A6,0.2)'),1);
  equal(p.parse('PERCENTILE(A1:A6,60%)'),3);
  equal(p.parse('PERCENTILE(A1:A6,50%)'),2.5);
  equal(p.parse('PERCENTILE(A1:A6,95%)'),4.75);

});

test("RANDBETWEEN",function(){
  p.setData({
    A1:1,
    A2:10
  });

  var rand;
  rand = p.parse('RANDBETWEEN(1,10)');
  ok(rand >= 1 && rand <= 10);
  rand = p.parse('RANDBETWEEN(A1,A2)');
  ok(rand >= 1 && rand <= 10);
  rand = p.parse('RANDBETWEEN(A2-A1,SUM(A1,A2))');
  ok(rand >= 9 && rand <= 11);

});

test("IF",function(){
  p.setData({
    A1:5,
    B1:4,
    A2:5,
    B2:0,
    A3:'TRUE'
  });

 deepEqual(p.parse('IF(B1=0, "div by zero", A1/B1)').valueOf(),1.25);
 deepEqual(p.parse('IF(B2=0, "div by zero", A2/B2)').valueOf(),'div by zero');
 deepEqual(p.parse('IF(B2=0, IF(TRUE,A1,B1), A2/B2)').valueOf(),5);
 deepEqual(p.parse('IF(A3, TRUE, FALSE)').toBool(),true);
});


test("LN",function(){
 deepEqual(p.parse('LN(1)'),0);
 deepEqual(p.parse('LN(100)'),4.605170185988092);
 deepEqual(p.parse('LN(0.5)'),-0.6931471805599453);
});

test("EXP", function(){
  equal(p.parse('EXP( 100 )'),parseFloat("2.6881171418161356e+43"));
  equal(p.parse('EXP( 0.1 )'),1.1051709180756477);
  equal(p.parse('EXP( 0 )'),1);
  equal(p.parse('EXP( -5 )'),0.006737946999085467);
});


test("POWER", function(){
  equal(p.parse('POWER( 1,2 )'),1);
  equal(p.parse('POWER( 2,2 )'),4);
  equal(p.parse('POWER( 2,3 )'),8);
});

test("SQRT", function(){
  p.setData({
    A1: 5.9
  });

  equal(p.parse('SQRT( 36 )'),6);
  equal(p.parse('SQRT( A1 )'),2.4289915602982237);
  deepEqual(p.parse('SQRT( -1 )'),EFP.Error.NUM);
  equal(p.parse('SQRT(POWER(2.5,2))'),2.5);
});

test("PI", function(){
  equal(p.parse('PI()'),Math.PI);
});

test("SQRTPI", function(){
  equal(p.parse('SQRTPI()'),Math.sqrt(Math.PI));
});

test("GAUSS", function(){
  equal(p.parse('GAUSS(2)').toFixed(5),0.47725);
});


test("CHIDIST", function(){
  equal(p.parse('CHIDIST(18.307,10)').toFixed(6),0.050001);
});

test("ERF",function(){
  equal(p.parse('ERF(0.74500)').toFixed(5),0.70793);
  equal(p.parse('ERF(1)').toFixed(5),0.842700);
});

test("NORMDIST", function(){
  p.setData({
    A1: 5.9
  });

  equal(p.parse('NORMDIST( 50, 40, 20, FALSE )').toFixed(9),0.017603266);
  equal(p.parse('NORMDIST( 0.8, 1, 0.3, TRUE )').toFixed(9),0.252492538);
});

test("NORM.DIST", function(){
  p.setData({
    A1: 5.9
  });

  equal(p.parse('NORM.DIST( 50, 40, 20, FALSE )').toFixed(9),0.017603266);
  equal(p.parse('NORM.DIST( 0.8, 1, 0.3, TRUE )').toFixed(9),0.252492538);
});

test("NORMSDIST", function(){
  equal(p.parse('NORMSDIST(-1.5)').toFixed(9), 0.066807201);
  equal(p.parse('NORMSDIST(0)'), 0.5);
  equal(p.parse('NORMSDIST(2.3)').toFixed(9), 0.989275890);
});


test("NORMSINV", function(){
  equal(p.parse('NORMSINV(0.25)').toFixed(9), -0.674489750);
  equal(p.parse('NORMSINV(0.55)').toFixed(9), 0.125661347);
  equal(p.parse('NORMSINV(0.9)').toFixed(9), 1.281551564);
});

test("LOGINV", function(){
  equal(p.parse('LOGINV(0.3,2,0.2)').toFixed(9), 6.653346075);
});


test("NORM.S.DIST", function(){
  equal(p.parse('NORM.S.DIST(0.5,FALSE)').toFixed(9), 0.352065327);
  equal(p.parse('NORM.S.DIST(0.8,TRUE)').toFixed(9), 0.788144601);
});


test("LOGNORMDIST", function(){
  equal(p.parse('LOGNORMDIST(12,10,5)').toFixed(9), 0.066417115);
});

test("LOGNORM.DIST", function(){
  //TODO fix lognormdist with accumulative set to FALSE 
  //equal(p.parse('LOGNORM.DIST(4,3.5,1.2,FALSE)').toFixed(9), 0.017618);
  equal(p.parse('LOGNORM.DIST(12,10,5,TRUE)').toFixed(9), 0.066417115);
});

test("STDEV", function(){
  p.setData({
    "A1":1345,
    "A2":1301,
    "A3":1368,
    "A4":1322,
    "A5":1310,
    "A6":1370,
    "A7":1318,
    "A8":1350,
    "A9":1303,
    "A10":1299
  });
  equal(p.parse('STDEV(A1:A10)').toFixed(5), 27.46392);
});

test("STDEV.S", function(){

  p.setData({
    A1:1,
    A2:2,
    A3:3,
    A4:4,
    A5:'"hallo"',
    A6:6,
    A7:7,
    A8:'TRUE'
  });

  equal(p.parse('STDEV.S(A:A)'),2.3166067138525404);
});


test("AND", function(){
  equal(p.parse('AND(TRUE,TRUE,TRUE)').toBool(),true);
  equal(p.parse('AND(TRUE,FALSE,TRUE)').toBool(),false);
  equal(p.parse('AND(5<=5,5>=1)').toBool(),true);
});


test("NORMINV", function(){
  equal(p.parse('=NORMINV(0.908789,40,1.5)').toFixed(0),42);
  deepEqual(p.parse('=NORMINV(-0.1,40,1.5)'),EFP.Error.NUM);
  deepEqual(p.parse('=NORMINV(1.1,40,1.5)'),EFP.Error.NUM);
  deepEqual(p.parse('=NORMINV(0.5,40,0)'),EFP.Error.NUM);
  deepEqual(p.parse('=NORMINV(-0.1,"non-numeric",1.5)'),EFP.Error.VALUE);


});

test("\"TRUE\"/\"FALSE\"",function(){
  var T1 = p.parse('"TRUE"');
  var F1 = p.parse('"FALSE"');
  var T2 = p.parse('"true"');
  var F2 = p.parse('"false"');

  deepEqual(T1,EFP.Bool.TRUE);
  deepEqual(F1,EFP.Bool.FALSE);
  deepEqual(T2,EFP.Bool.TRUE);
  deepEqual(F2,EFP.Bool.FALSE);

  equal(T1.valueOf(),true);
  equal(F1.valueOf(),false);
  equal(T2.valueOf(),true);
  equal(F2.valueOf(),false);
});

test("ISBLANK", function(){
  p.setData({
    A1: '"NOTBLANK"'
  });
  equal(p.parse('ISBLANK(A2)').toBool(),true);
  equal(p.parse('ISBLANK(A1)').toBool(),false);
});

test("ROUND", function(){
  p.setData({
    A2: '5.28',
    A3: '5.9999',
    A4: '99.5',
    A5: '-6.3',
    A6: '-100.5',
    A7: '-22.45',
    A8: '999',
    A9: '991',
    A10: '941',
  });
  equal(p.parse('ROUND(100.319,1)'),100.3);
  equal(p.parse('ROUND(A2,1)'),5.3);
  equal(p.parse('ROUND(A3,3)'),6);
  equal(p.parse('ROUND(A4,0)'),100);
  equal(p.parse('ROUND(A5,0)'),-6);
  equal(p.parse('ROUND(A6,0)'),-101);
  equal(p.parse('ROUND(A7,1)'),-22.5);
  equal(p.parse('ROUND(A8,-1)'),1000);
  equal(p.parse('ROUND(A9,-1)'),990);
  equal(p.parse('ROUND(A10,-2)'),900);
});