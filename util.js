let N; //number of subconductors in bundle
let s,d1,d2,d3; // spacings
let n; //number of strands in a subconductor
let d; //diameter of a strand
let Dia; //diameter of subconductor
let l; //length of line
let R; //resistance of line per km
let L; //inductance of line per km
let Cap; //capacitance of line per km
let Xl;//inductive reactance
let Xc;//capcitive reactance
let f; //power frequency
let V; //nominal system voltage
let Vs; // Sending end voltage
let Is; //Sending end current
let Ir; //Receiving end current
let Pr; //receiving end load
let Ps; //sending end load
let pfr; //pf of receiving
let r; //radius of subconductor
let A,B,C,D; //ABCD Parameters
let Ich; //Charging Current
s=[]
let comp; //compensation
let sign;//sign
let epsilon =  8.85*Math.pow(10,-12);

let sgmdIp = document.getElementById('sgmd');
let symRad = document.getElementById('sym');
let unsymRad = document.getElementById('unsym');
let dInp = document.getElementsByClassName('md');
let labels = document.querySelectorAll('span');
let inputs = document.querySelectorAll('#params input')
let seEnd = document.getElementById('s');
let reEnd = document.getElementById('r');

document.addEventListener("wheel", function(event){
    if(document.activeElement.type === "number"){
        document.activeElement.blur();
    }
});
function graph(Cs,Cr,r) {
  let graph1 = Desmos.GraphingCalculator(seEnd,{keypad:false});
  let graph2 = Desmos.GraphingCalculator(reEnd,{keypad:false});
  document.querySelectorAll('.hide')[0].style.display="block";
  document.querySelectorAll('.hide')[1].style.display="block";
  r/=Math.pow(10,6);
  
  graph1.setExpression({ id: "graph1", latex: `(x-${Cs[0]/Math.pow(10,6)})^2+(y-${Cs[1]/Math.pow(10,6)})^2=${r*r}` });
  graph2.setExpression({ id: "graph2", latex: `(x+${Cr[0]/Math.pow(10,6)})^2+(y+${Cr[1]/Math.pow(10,6)})^2=${r*r}` });
}
function mgmd(d1,d2,d3){
    return Math.cbrt(d1*d2*d3);
}
function sgmdRoot(prod,m){
    return Math.pow(prod,1/(m*m))
}
function stringSeparator(){
    let w = sgmdIp.value;
    s_w = w.split(',')
    let i=0;
    let s=[]
    s_w.forEach(ele => {
     s.push(parseFloat(ele)) 
     i++  
    });
    return s;
}
function subDia(N,d){
    let m = (3+math.sqrt(12*N-3))/6; //number of layers
    let D = (2*m-1)*d; //diameter of subconductor
    return D
}
function receivingCurr(Pr, pfr,V){
    let Ir=Pr/(V*pfr*math.sqrt(3));
    return Ir;
}
function abcdParams(model,z,y=1){
    if(model === "S"){
        A = 1
        B =z
        C=0
        D=A
    }else if(model ==="N"){
        let a = math.add(1,math.divide(math.multiply(z,y),2))
        A = a
        B =z
        let c = math.add(y,math.divide(math.multiply(z,math.multiply(y,y)),4))
        C=c
        D=A
    }
    else if(model === "L"){
        let gamma = math.sqrt(math.multiply(z,y))
        let Zc =math.sqrt(math.divide(z,y));
        let a = math.cosh(gamma)
        A = a
        let b = math.multiply(Zc,math.sinh(gamma))
        B =b
        let c = math.divide(math.sinh(gamma),Zc)
        C=c
        D = A
    }
}

function VR(V){
    let Vnl= math.abs(Vs)/math.abs(A);
    let vr=(Vnl-V)/V;
    return vr*100;
}
function effc(Pr,Vs,Is){
    Ps = 3*math.abs(Vs)*math.abs(Is)*math.cos(math.atan(Vs.im/Vs.re)-math.atan(Is.im/Is.re))
    let eff = 100*Pr/Ps 
    return eff;
}
function sgmd(Nc,sd,ele){
    let r_dash
    //let r=0.006
    let r = Dia/2;
    if(ele==="L"){
        r_dash=r*0.7788;
    }
    if(ele==="C"){
         r_dash=r;
    }
    let prod = 1;
    for(let i=0;i<sd.length;i++){
        prod*=sd[i];
    }
    prod=Math.pow(prod,2)
    prod*=Math.pow(r_dash,Nc)
    return sgmdRoot(prod,Nc);
 }
//inductance per km
function inductance(N,s,d1,d2,d3){
    let SGMD = sgmd(N,s,"L")
    let MGMD = mgmd(d1,d2,d3)
    let L = 2*Math.pow(10,-7)*Math.log(MGMD/SGMD);
    console.log(L)
    return L*1000
}
//capacitance per km
function capacitance(N,s,d1,d2,d3){
    let SGMD = sgmd(N,s,"C")
    let MGMD = mgmd(d1,d2,d3)
    let C = 2*Math.PI*epsilon/Math.log(MGMD/SGMD);
    return C*1000
}

//charging current
function chargingCurr(C,Vr){
    return math.multiply(C,Vr)
}

//Compensation
function compensation(){
    let Cr=[]
    let Vp=parseFloat(V)/math.sqrt(3)
    Cr.push((math.abs(A)*Math.pow(Vp,2)*math.cos(math.atan(B.im/B.re)))/math.abs(B))
    Cr.push((math.abs(A)*Math.pow(Vp,2)*math.sin(math.atan(B.im/B.re)))/math.abs(B))
    let r = Vp*Vp/math.abs(B);
    r/=Math.pow(10,6)
    let Qr=math.sqrt(Math.pow(r,2)-Math.pow((Pr/(3*Math.pow(10,6))+Cr[0]/Math.pow(10,6)),2)) - Cr[1]/Math.pow(10,6);
    let Q = sign*math.sin(math.acos(pfr))*Pr/(pfr*Math.pow(10,6))/3;
    console.log(Q,Qr)
    return (Qr-Q)
}