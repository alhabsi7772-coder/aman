import json
# Al MAAN Exchange 5-year model (OMR)
YEARS=[1,2,3,4,5]
open_units=[0,5,10,16,22]; close_units=[5,10,16,22,28]
adds=[5,5,6,6,6]
hotel_units=[5,8,12,16,20]; mall_units=[0,2,4,6,8]
txn=[15,17.5,17.5,17.5,17.5]
price={5:3019.75,3:3069.75,10:2747}
SW_SETUP=7654; SW_UNIT=46*12
staff=[2,3,4,5,6]; omani=[0,1,2,3,4]
admin=[0,6000,12000,14400,18000]
rent=[1020,1020,1800,1800,1800]
vehicle=[1440,1440,2880,2880,2880]
fuel=[1200,1200,2400,2400,2400]
marketing=[1200,2400,2400,3000,3000]
licence=[1500,2000,2000,2500,2500]
FLOAT_UNIT=1000
EQUITY=31000

def run(margin):
    out=[]; cash=EQUITY; cum_cap=0; cum_dep=0; re=0; float_bal=0
    for i,y in enumerate(YEARS):
        avg=close_units[i]
        rev=(open_units[i]*17.5+adds[i]*15)*margin*365
        capex=adds[i]*price[5]+(SW_SETUP if i==0 else 0)
        cum_cap+=capex
        sw=SW_UNIT*avg
        st=(staff[i]-omani[i])*6000+omani[i]*6600
        telecom=9*12*avg
        maint=(120*open_units[i]) if i>0 else 0
        ins=60*close_units[i]
        reg=0.02*rev
        opex=sw+st+admin[i]+rent[i]+vehicle[i]+fuel[i]+telecom+maint+ins+marketing[i]+licence[i]+reg
        ebitda=rev-opex
        dep=cum_cap/5
        cum_dep+=dep
        ebt=ebitda-dep
        rate=0.03 if rev<=100000 else 0.15
        tax=max(0,ebt*rate)
        ni=ebt-tax
        dfloat=adds[i]*FLOAT_UNIT; float_bal+=dfloat
        fcf=ebitda-tax-capex-dfloat
        cash+=fcf
        re+=ni
        out.append(dict(year=y,avg=avg,close=close_units[i],rev=rev,sw=sw,staff=st,admin=admin[i],rent=rent[i],vehicle=vehicle[i],fuel=fuel[i],telecom=telecom,maint=maint,ins=ins,marketing=marketing[i],licence=licence[i],reg=reg,opex=opex,ebitda=ebitda,dep=dep,ebt=ebt,tax=tax,ni=ni,capex=capex,dfloat=dfloat,fcf=fcf,cash=cash,nfa=cum_cap-cum_dep,float=float_bal,re=re,equity=EQUITY+re))
    return out

def npv(r,cfs): return sum(cf/(1+r)**t for t,cf in enumerate(cfs))
def irr(cfs):
    lo,hi=-0.99,10
    for _ in range(200):
        mid=(lo+hi)/2
        if npv(mid,cfs)>0: lo=mid
        else: hi=mid
    return mid

for m in [0.5,0.8,1.2]:
    o=run(m)
    cfs=[-EQUITY]+[r['fcf'] for r in o]
    # terminal: recover float + residual cash? no TV
    print(f"\n=== margin {m} ===")
    for r in o:
        print({k:(round(v) if isinstance(v,float) else v) for k,v in r.items()})
    print("NPV10", round(npv(0.10,cfs)), "IRR", round(irr(cfs)*100,1), "ROI(5y NI/eq)", round(sum(r['ni'] for r in o)/EQUITY*100,1))
    cum=-EQUITY
    for t,r in enumerate(o):
        cum+=r['fcf']; print(" cum",t+1,round(cum))
