import math
def s2l(c): c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def l2s(c):
    c=max(0.0,min(1.0,c)); v=12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055
    return round(v*255)
M1=[[0.4122214708,0.5363325363,0.0514459929],[0.2119034982,0.6806995451,0.1073969566],[0.0883024619,0.2817188376,0.6299787005]]
M2=[[0.2104542553,0.7936177850,-0.0040720468],[1.9779984951,-2.4285922050,0.4505937099],[0.0259040371,0.7827717662,-0.8086757660]]
def hex2oklab(h):
    h=h.lstrip('#'); r,g,b=[s2l(int(h[i:i+2],16)) for i in (0,2,4)]
    l,m,s=[sum(M1[i][j]*v for j,v in enumerate((r,g,b))) for i in range(3)]
    l,m,s=[math.copysign(abs(v)**(1/3),v) for v in (l,m,s)]
    return [sum(M2[i][j]*v for j,v in enumerate((l,m,s))) for i in range(3)]
def oklab2hex(L,a,b):
    l_=L+0.3963377774*a+0.2158037573*b; m_=L-0.1055613458*a-0.0638541728*b; s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=[v**3 for v in (l_,m_,s_)]
    Mi=[[4.0767416621,-3.3077115913,0.2309699292],[-1.2684380046,2.6097574011,-0.3413193965],[-0.0041960863,-0.7034186147,1.7076147010]]
    rgb=[sum(Mi[i][j]*v for j,v in enumerate((l,m,s))) for i in range(3)]
    return '#%02X%02X%02X'%tuple(l2s(c) for c in rgb)
def rl(h):
    h=h.lstrip('#'); r,g,b=[s2l(int(h[i:i+2],16)) for i in (0,2,4)]
    return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b):
    la,lb=sorted((rl(a),rl(b))); return round((lb+0.05)/(la+0.05),2)

# Anchor on the brand mark's hue so the ramp IS the brand, evenly spaced in L.
L,a,b = hex2oklab('#6922F5')
hue = math.atan2(b,a); chroma = math.hypot(a,b)
print(f"brand #6922F5 -> L={L:.3f} C={chroma:.3f} h={math.degrees(hue):.1f}deg\n")
# Chroma tapers at the light and dark ends or the ramp turns neon / muddy.
# The shipped ramp. Every value in globals.css --v-* comes from this table;
# running this file must reproduce them byte-for-byte before it is trusted to
# emit a new one. 800 was added for employer --accent-ink (see globals.css).
steps=[(50,0.972,0.16),(100,0.930,0.34),(200,0.862,0.55),(300,0.760,0.78),
       (400,0.652,0.95),(500,0.548,1.00),(600,0.470,0.92),(700,0.395,0.78),
       (800,0.320,0.62)]
ramp={}
for name,Lt,cs in steps:
    C=chroma*cs
    hx=oklab2hex(Lt, C*math.cos(hue), C*math.sin(hue))
    ramp[name]=hx
    print(f"--v-{name}: {hx};   on-white {cr(hx,'#FFFFFF'):>5}  white-on {cr('#FFFFFF',hx):>5}  on-ink {cr(hx,'#0B0A09'):>5}")
print()
for n in (500,600,700):
    print(f"v-{n} as button fill, white text: {cr('#FFFFFF',ramp[n])}  {'AA' if cr('#FFFFFF',ramp[n])>=4.5 else 'FAIL'}")
for n in (600,700):
    print(f"v-{n} as text on white:           {cr(ramp[n],'#FFFFFF')}  {'AA' if cr(ramp[n],'#FFFFFF')>=4.5 else 'FAIL'}")
for n in (200,300):
    print(f"v-{n} as text on ink #0B0A09:     {cr(ramp[n],'#0B0A09')}  {'AA' if cr(ramp[n],'#0B0A09')>=4.5 else 'FAIL'}")
