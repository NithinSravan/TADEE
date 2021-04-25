//initialises input values to variables
function init(){
    N = inputs[0].value;
    if(symRad.checked){
       d1=dInp[0].value;
       d2=d1;
       d3=d1;
   }
   else{
       d1=dInp[0].value;
       d2=dInp[1].value;
       d3=dInp[2].value;
   }
   n=inputs[5].value; 
   d=inputs[6].value;
   l=inputs[7].value; 
   R=inputs[8].value; 
   f=inputs[9].value; 
   V=inputs[10].value*Math.pow(10,3);
   Pr=inputs[11].value*Math.pow(10,6); 
   pfr=inputs[12].value;
   Dia = subDia(n,d);


   console.log(d)
   s=stringSeparator()
   L =inductance(N,s,d1,d2,d3)
   Cap=capacitance(N,s,d1,d2,d3)
   Xl = 2*Math.PI*f*l*L;
   Xc = 1/(2*Math.PI*f*l*Cap);

}

//all calculations are routed through this
function calculate(){
    let str
    let y=math.complex(0,1/Xc);
    let z = math.complex(R*l,Xl);
  

    let drop=document.getElementById('drop')
    if(drop.value==="short"){
        console.log("Short");
        str="Short"
        abcdParams("S",z)

    }else if(drop.value==="nominalpi"){
        console.log("Nominal-Pi");
        str="Nominal-Pi"
        abcdParams("N",z,y)
    
    }else if(drop.value==="long"){
        console.log("Long");
        str="Long"
        abcdParams("L",z,y)
    }

    if(pfr<0){
        pfr=math.abs(pfr)
        Ir= math.complex({r:receivingCurr(Pr,pfr,V),phi:-math.acos(pfr)});
        sign =1;
    }
    else{
        pfr=math.abs(pfr)
        Ir= math.complex({r:receivingCurr(Pr,pfr,V),phi:math.acos(pfr)});
        sign =-1;
    }

    let a =math.multiply(A,parseFloat(V)/math.sqrt(3))
    let b= math.multiply(B,Ir)
    let c=math.multiply(C,parseFloat(V)/math.sqrt(3))
    let d =math.multiply(D,Ir)

    Vs=math.add(a,b);
    Is=math.add(c,d);

    let Vr=VR(parseFloat(V)/math.sqrt(3))
    let eff=effc(Pr,Vs,Is)
    let comp
    let Cs=[]
    let Cr=[]
    let Vp=parseFloat(V)/math.sqrt(3)
  
    if(drop.value==="short"){
        Cs.push((math.abs(D)*Math.pow(math.abs(Vs),2)*math.cos(math.atan(B.im/B.re)))/math.abs(B))
        Cs.push((math.abs(D)*Math.pow(math.abs(Vs),2)*math.sin(math.atan(B.im/B.re)))/math.abs(B))
        Cr.push((math.abs(A)*Math.pow(Vp,2)*math.cos(math.atan(B.im/B.re)))/math.abs(B))
        Cr.push((math.abs(A)*Math.pow(Vp,2)*math.sin(math.atan(B.im/B.re)))/math.abs(B))
    }
    else{
        Cs.push((math.abs(D)*Math.pow(math.abs(Vs),2)*math.cos(math.atan(B.im/B.re)-math.atan(D.im/D.re)))/math.abs(B))
        Cs.push((math.abs(D)*Math.pow(math.abs(Vs),2)*math.sin(math.atan(B.im/B.re)-math.atan(D.im/D.re)))/math.abs(B))
        Cr.push((math.abs(A)*Math.pow(Vp,2)*math.cos(math.atan(B.im/B.re)-math.atan(A.im/A.re)))/math.abs(B))
        Cr.push((math.abs(A)*Math.pow(Vp,2)*math.sin(math.atan(B.im/B.re)-math.atan(A.im/A.re)))/math.abs(B))
    }

    let Rc = math.abs(Vs)*Vp/math.abs(B);
    graph(Cs,Cr,Rc)


    let inputDiv=document.getElementById("visible");
    let inputHead=document.getElementById("inputhead");
    inputDiv.style.display="none";
    inputHead.style.display="none";
    let outputDiv=document.getElementById("invisible");
    let outputHead=document.getElementById("outputhead");
    let graphDiv=document.getElementById("graphsec");
    graphDiv.style.display="flex"
    let op = document.getElementsByClassName("op");
    outputDiv.style.display="flex"
    outputHead.style.display="flex"
    Ich=chargingCurr();
    op[0].innerText=str;
    

    op[1].innerText=math.round(L,5);
    op[2].innerText=math.round(Cap,12);
    op[3].innerText=math.round(Xl,5);
    op[4].innerText=math.round(Xc,5);
    op[5].innerText=math.round(A,5);
    op[6].innerText=math.round(B,5);
    op[7].innerText=math.round(C,5);
    op[8].innerText=math.round(D,5);
    op[9].innerText=math.round(Vs,5);
    op[10].innerText=math.round(Is,5);
    op[11].innerText=math.round(Vr,5);
    op[12].innerText=math.round((Ps-Pr)/math.pow(10,6),5);
    op[13].innerText=math.round(eff,5);
    op[14].innerText=math.round(Ich,5);
    
    if(drop.value ==="short"){
        comp=compensation()
        
        if(comp == "undefined"){
            op[15].innerText="invalid"
        }
        else{
            op[15].innerText=math.round(comp,5)
        }
        document.getElementsByClassName('h')[0].style.display="block"
        if(comp<0)
        document.getElementsByClassName('h')[1].style.display="block"
        else
        document.getElementsByClassName('h')[2].style.display="block"
    }
    else{
        op[15].style.display="none"
        document.getElementsByClassName('h')[0].style.display="none"
       
    }
 
}

//main control is transfered to this function
function master(){
    let flag=true;
    inputs.forEach(e => {
        if(!e.disabled){
            if(e.value=="")
            flag=false
        }
    });
    
    window.scrollBy(0,-(2*window.innerHeight+100))
    if(flag){
        document.getElementsByClassName('warning')[0].style.display="none"
        init()
        calculate()
    }
    else{
        document.getElementsByClassName('warning')[0].style.display="block"
    }

}

//checks if it is symmetrical or non-symmetrical
function onCheck(){
    if(symRad.checked){
        dInp[1].disabled=true;
        dInp[2].disabled=true;
        dInp[1].value=""
        dInp[2].value=""
        dInp[1].placeholder=""
        dInp[2].placeholder=""
        labels[3].innerText="Enter the value of d in m";
    }
    else{
        dInp[1].disabled=false;
        dInp[2].disabled=false;
        labels[3].innerText="Enter the value of d1 in m";
    }
}

//print output as PDF
function printDiv() {
    html2pdf(document.body, { margin: 10,
        filename:     'TADEE_Project_Output.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 1, logging: true, dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a3', orientation: 'portrait' }});
  }

//print input as PDF
function printInp() {
    html2pdf(document.body, { margin: 10,
        filename:     'TADEE_Project_Input.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 1, logging: true, dpi: 192, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a3', orientation: 'portrait' }});
  }