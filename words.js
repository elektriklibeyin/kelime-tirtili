/* Kelime Tırtılı — A1 / A2 İngilizce kelimeler.
   Biçim: ingilizce=türkçe; birden çok anlam "/" ile ayrılır.
   İngilizcede "/" ile yazılanlar aynı kelimenin kabul edilen yazımlarıdır (grey/gray). */
const WORD_DATA = {
  A1: {
    '🔢 Sayılar ve zaman': `
one=bir|two=iki|three=üç|four=dört|five=beş|six=altı|seven=yedi|eight=sekiz|nine=dokuz|ten=on
eleven=on bir|twelve=on iki|thirteen=on üç|fifteen=on beş|twenty=yirmi|thirty=otuz|forty=kırk|fifty=elli
sixty=altmış|seventy=yetmiş|eighty=seksen|ninety=doksan|hundred=yüz (sayı)|thousand=bin|million=milyon
first=birinci/ilk|second=ikinci/saniye|third=üçüncü|half=yarım/yarı|number=sayı/numara
Monday=pazartesi|Tuesday=salı|Wednesday=çarşamba|Thursday=perşembe|Friday=cuma|Saturday=cumartesi|Sunday=pazar
January=ocak|February=şubat|March=mart|April=nisan|May=mayıs|June=haziran|July=temmuz|August=ağustos
September=eylül|October=ekim|November=kasım|December=aralık
day=gün|week=hafta|month=ay (takvim)|year=yıl|hour=saat (süre)|minute=dakika|morning=sabah|afternoon=öğleden sonra
evening=akşam|night=gece|today=bugün|tomorrow=yarın|yesterday=dün|time=zaman|weekend=hafta sonu
spring=ilkbahar|summer=yaz|autumn/fall=sonbahar|winter=kış|birthday=doğum günü|clock=duvar saati|date=tarih (gün)|noon=öğle`,
    '🎨 Renkler ve şekiller': `
red=kırmızı|blue=mavi|green=yeşil|yellow=sarı|black=siyah|white=beyaz|orange=turuncu/portakal|pink=pembe
purple=mor|brown=kahverengi|grey/gray=gri|colour/color=renk|gold=altın|silver=gümüş|circle=daire|square=kare
line=çizgi/sıra|shape=şekil|triangle=üçgen|star=yıldız`,
    '👨‍👩‍👧 Aile ve insanlar': `
mother=anne|father=baba|parent=ebeveyn|brother=erkek kardeş|sister=kız kardeş|son=oğul|daughter=kız evlat
baby=bebek|child=çocuk|children=çocuklar|boy=erkek çocuk|girl=kız çocuk|man=adam|woman=kadın|people=insanlar
person=kişi|friend=arkadaş|family=aile|grandmother=büyükanne|grandfather=büyükbaba|uncle=amca/dayı|aunt=teyze/hala
cousin=kuzen|husband=koca|wife=karı/hanım|name=isim/ad|surname=soyadı|mum=anneciğim|dad=babacığım
best friend=en yakın arkadaş|boyfriend=erkek arkadaş|girlfriend=kız arkadaş|neighbour/neighbor=komşu|guest=misafir`,
    '🧍 Vücut': `
head=baş/kafa|hair=saç|eye=göz|ear=kulak|nose=burun|mouth=ağız|tooth=diş|teeth=dişler|face=yüz (surat)|arm=kol
hand=el|finger=parmak|leg=bacak|foot=ayak|feet=ayaklar|back=sırt/geri|neck=boyun|body=vücut|heart=kalp|stomach=mide
knee=diz|shoulder=omuz|lip=dudak|tongue=dil (organ)|skin=deri/cilt`,
    '🍎 Yiyecek ve içecek': `
apple=elma|banana=muz|bread=ekmek|butter=tereyağı|cheese=peynir|egg=yumurta|milk=süt|water=su|tea=çay|coffee=kahve
juice=meyve suyu|meat=et|chicken=tavuk|fish=balık|rice=pirinç|soup=çorba|salad=salata|sugar=şeker|salt=tuz
fruit=meyve|vegetable=sebze|potato=patates|tomato=domates|onion=soğan|carrot=havuç|cake=kek/pasta|chocolate=çikolata
ice cream=dondurma|sandwich=sandviç|breakfast=kahvaltı|lunch=öğle yemeği|dinner=akşam yemeği|food=yiyecek|drink=içecek/içmek
grape=üzüm|lemon=limon|strawberry=çilek|pear=armut|watermelon=karpuz|honey=bal|oil=yağ (sıvı)|pasta=makarna
cookie/biscuit=kurabiye/bisküvi|meal=öğün|restaurant=lokanta|sweets=şekerleme|hamburger=hamburger
cola=kola|chips=cips|pizza=pizza|olive=zeytin|yoghurt/yogurt=yoğurt`,
    '🏠 Ev ve eşyalar': `
house=ev|home=ev/yuva|room=oda|kitchen=mutfak|bathroom=banyo|bedroom=yatak odası|living room=oturma odası
garden=bahçe|door=kapı|window=pencere|table=masa|chair=sandalye|bed=yatak|sofa=kanepe|floor=zemin/kat|wall=duvar
lamp=lamba|key=anahtar|box=kutu|cup=fincan|glass=bardak/cam|plate=tabak|knife=bıçak|fork=çatal|spoon=kaşık
bottle=şişe|mirror=ayna|picture=resim|television=televizyon|phone=telefon|computer=bilgisayar|towel=havlu|soap=sabun
fridge=buzdolabı|stairs=merdiven|roof=çatı|flat=daire (ev)|bag=çanta|umbrella=şemsiye|blanket=battaniye
toy=oyuncak|camera=fotoğraf makinesi|radio=radyo|shower=duş|toilet=tuvalet|light=ışık/hafif|cupboard=dolap|shelf=raf`,
    '🏫 Okul ve iş': `
school=okul|class=sınıf|classroom=derslik|lesson=ders|book=kitap|pen=tükenmez kalem|pencil=kurşun kalem|paper=kağıt
notebook=defter|desk=sıra/çalışma masası|board=tahta|homework=ödev|exam=sınav|question=soru|answer=cevap/cevaplamak
word=kelime|letter=harf/mektup|sentence=cümle|page=sayfa|English=İngilizce|Turkish=Türkçe|language=dil (lisan)|map=harita
library=kütüphane|job=iş (meslek)|office=ofis/büro|money=para|teacher=öğretmen|student=öğrenci|doctor=doktor
nurse=hemşire|farmer=çiftçi|driver=şoför|cook=aşçı/pişirmek|waiter=garson|singer=şarkıcı|artist=sanatçı
engineer=mühendis|dentist=diş hekimi|police officer=polis memuru|shop assistant=tezgâhtar|worker=işçi|rubber/eraser=silgi
ruler=cetvel|schoolbag=okul çantası|alphabet=alfabe|grammar=dil bilgisi|vocabulary=kelime bilgisi`,
    '🐾 Hayvanlar': `
cat=kedi|dog=köpek|bird=kuş|horse=at|cow=inek|sheep=koyun|duck=ördek|rabbit=tavşan|mouse=fare|lion=aslan
tiger=kaplan|elephant=fil|monkey=maymun|bear=ayı|snake=yılan|frog=kurbağa|bee=arı|butterfly=kelebek|caterpillar=tırtıl
spider=örümcek|ant=karınca|fox=tilki|wolf=kurt|pig=domuz|goat=keçi|camel=deve|giraffe=zürafa|turtle=kaplumbağa
owl=baykuş|shark=köpekbalığı|dolphin=yunus|animal=hayvan|pet=evcil hayvan|insect=böcek|puppy=köpek yavrusu
kitten=kedi yavrusu|hen=tavuk (dişi)|chick=civciv|donkey=eşek|zebra=zebra|crocodile=timsah|penguin=penguen`,
    '🌳 Doğa ve hava': `
sun=güneş|moon=ay (gökteki)|sky=gökyüzü|cloud=bulut|rain=yağmur|snow=kar|wind=rüzgâr|weather=hava durumu
hot=sıcak|cold=soğuk/nezle|warm=ılık|tree=ağaç|flower=çiçek|leaf=yaprak|grass=çimen|sea=deniz|river=nehir|lake=göl
mountain=dağ|forest=orman|beach=plaj|island=ada|world=dünya|fire=ateş|stone=taş|sand=kum|air=hava (soluduğumuz)
ice=buz|rainbow=gökkuşağı|storm=fırtına|sunny=güneşli|rainy=yağmurlu|cloudy=bulutlu|windy=rüzgârlı|snowy=karlı
park=park|farm=çiftlik|field=tarla|hill=tepe|plant=bitki`,
    '🚌 Şehir ve ulaşım': `
city=şehir|town=kasaba|village=köy|street=sokak|road=yol|car=araba|bus=otobüs|train=tren|plane=uçak
bicycle/bike=bisiklet|boat=tekne|ship=gemi|taxi=taksi|station=istasyon|airport=havalimanı|hospital=hastane|bank=banka
shop=dükkân|market=pazar|supermarket=süpermarket|hotel=otel|cinema=sinema|museum=müze|bridge=köprü|ticket=bilet
country=ülke|place=yer|building=bina|mosque=cami|post office=postane|bus stop=otobüs durağı|car park=otopark
motorbike=motosiklet|underground=metro|zoo=hayvanat bahçesi|pharmacy=eczane|bakery=fırın (dükkân)`,
    '👕 Giysiler': `
shirt=gömlek|T-shirt=tişört|dress=elbise|skirt=etek|trousers=pantolon|jeans=kot pantolon|shoe=ayakkabı|sock=çorap
hat=şapka|coat=palto|jacket=ceket|sweater=kazak|glove=eldiven|scarf=atkı|boot=bot/çizme|clothes=kıyafetler
belt=kemer|watch=izlemek/kol saati|glasses=gözlük|pocket=cep|ring=yüzük/çalmak (zil)|cap=kep|pyjamas=pijama
shorts=şort|wear=giymek|uniform=üniforma`,
    '🏃 Fiiller': `
have=sahip olmak|do=yapmak|make=yapmak/üretmek|go=gitmek|come=gelmek|see=görmek|look=bakmak|eat=yemek yemek
sleep=uyumak|read=okumak|write=yazmak|speak=konuşmak|talk=sohbet etmek|listen=dinlemek|hear=duymak|play=oynamak
run=koşmak|walk=yürümek|swim=yüzmek|sing=şarkı söylemek|dance=dans etmek|open=açmak/açık|close=kapatmak
buy=satın almak|sell=satmak|give=vermek|take=almak/götürmek|want=istemek|like=hoşlanmak/beğenmek|love=sevmek/aşk
know=bilmek|think=düşünmek|learn=öğrenmek|teach=öğretmek|study=ders çalışmak|work=çalışmak|live=yaşamak
help=yardım etmek|ask=sormak|wash=yıkamak|clean=temizlemek/temiz|sit=oturmak|stand=ayakta durmak|start=başlamak
stop=durmak|wait=beklemek|find=bulmak|lose=kaybetmek|get=almak/elde etmek|put=koymak|say=söylemek|tell=anlatmak
call=aramak (telefonla)|meet=tanışmak/buluşmak|visit=ziyaret etmek|travel=seyahat etmek|fly=uçmak|drive=araba sürmek
ride=binmek|carry=taşımak|draw=çizmek|paint=boyamak|jump=zıplamak|climb=tırmanmak|smile=gülümsemek|laugh=gülmek
cry=ağlamak|feel=hissetmek|need=ihtiyaç duymak|try=denemek|use=kullanmak|understand=anlamak|remember=hatırlamak
forget=unutmak|finish=bitirmek|change=değiştirmek|move=taşınmak/hareket etmek|turn=dönmek|show=göstermek
send=göndermek|bring=getirmek|pay=ödemek|win=kazanmak|grow=büyümek|wake up=uyanmak|get up=kalkmak
come back=geri gelmek|spell=hecelemek|count=saymak|cut=kesmek|kick=tekme atmak|throw=atmak/fırlatmak|catch=yakalamak
go out=dışarı çıkmak|have breakfast=kahvaltı yapmak|brush=fırçalamak/fırça`,
    '✨ Sıfatlar': `
big=büyük|small=küçük|long=uzun|short=kısa|tall=uzun boylu|new=yeni|old=eski/yaşlı|young=genç|good=iyi|bad=kötü
happy=mutlu|sad=üzgün|beautiful=güzel|pretty=hoş/sevimli|ugly=çirkin|fast=hızlı|slow=yavaş|easy=kolay|difficult=zor
cheap=ucuz|expensive=pahalı|rich=zengin|poor=fakir|full=dolu|empty=boş|dirty=kirli|hungry=aç|thirsty=susamış
tired=yorgun|angry=kızgın|busy=meşgul|free=serbest/bedava|right=doğru/sağ|wrong=yanlış|left=sol|high=yüksek
low=alçak|heavy=ağır|dark=karanlık/koyu|nice=hoş|great=harika|funny=komik|kind=nazik/tür|friendly=arkadaş canlısı
quiet=sessiz|loud=gürültülü|strong=güçlü|weak=zayıf (güçsüz)|wet=ıslak|dry=kuru|sick=hasta|favourite/favorite=en sevilen
different=farklı|same=aynı|important=önemli|interesting=ilginç|boring=sıkıcı|delicious=lezzetli|sweet=tatlı|near=yakın
far=uzak|early=erken|late=geç|soft=yumuşak|ready=hazır|hard=sert/zor|lovely=çok hoş|bad-tempered=huysuz
little=küçük/az|fine=iyi/güzel|cool=serin/havalı|true=gerçek/doğru|correct=doğru (hatasız)|wonderful=harika/muhteşem`,
    '❓ Küçük kelimeler': `
yes=evet|no=hayır|please=lütfen|thank you=teşekkür ederim|hello=merhaba|goodbye=hoşça kal|sorry=özür dilerim
what=ne|where=nerede|when=ne zaman|who=kim|why=neden|how=nasıl|which=hangi|here=burada|there=orada|now=şimdi
always=her zaman|never=asla|often=sık sık|sometimes=bazen|usually=genellikle|very=çok (pek)|and=ve|but=ama|or=veya
with=ile|without=-sız/olmadan|in=içinde|on=üstünde|under=altında|behind=arkasında|next to=yanında|between=arasında
before=önce|after=sonra|again=tekrar|together=birlikte|everyone=herkes|something=bir şey|nothing=hiçbir şey
maybe=belki|also=ayrıca/de|only=sadece|because=çünkü|every=her|all=hepsi/bütün|many=birçok|much=çok (miktar)
how much=ne kadar|how many=kaç tane|excuse me=affedersiniz|welcome=hoş geldin|good morning=günaydın
good night=iyi geceler|of course=elbette|here you are=buyurun|see you=görüşürüz`,
    '⚽ Hobiler ve spor': `
football=futbol|game=oyun|music=müzik|song=şarkı|film/movie=film|sport=spor|ball=top|team=takım|hobby=hobi
party=parti|holiday=tatil|photo=fotoğraf|guitar=gitar|piano=piyano|pool=havuz|basketball=basketbol|volleyball=voleybol
tennis=tenis|swimming=yüzme|running=koşu|cycling=bisiklet sürme|picnic=piknik|drawing=resim çizme|dancing=dans
puzzle=bulmaca|chess=satranç|card=kart|kite=uçurtma|doll=oyuncak bebek|cartoon=çizgi film|story=hikâye|poem=şiir`,
  },
  A2: {
    '😊 Duygular ve kişilik': `
afraid=korkmuş|worried=endişeli|excited=heyecanlı|bored=sıkılmış|surprised=şaşırmış|nervous=gergin|proud=gururlu
lonely=yalnız (hisseden)|calm=sakin|brave=cesur|shy=utangaç|lazy=tembel|clever=zeki|polite=kibar|rude=kaba
honest=dürüst|careful=dikkatli|careless=dikkatsiz|generous=cömert|selfish=bencil|patient=sabırlı/hasta (hastane)
serious=ciddi|confident=kendinden emin|jealous=kıskanç|cheerful=neşeli|embarrassed=utanmış/mahcup
disappointed=hayal kırıklığına uğramış|relaxed=rahatlamış|upset=keyfi kaçmış|crazy=deli|fear=korku|feeling=duygu
hope=umut/ummak|mood=ruh hali|smart=akıllı|stupid=aptal|silly=saçma/sersem|strict=katı/sert|gentle=yumuşak huylu
hard-working=çalışkan|scared=korkmuş (ürkmüş)|glad=memnun|anxious=kaygılı`,
    '🩺 Sağlık': `
ill=hasta (rahatsız)|headache=baş ağrısı|toothache=diş ağrısı|stomach ache=karın ağrısı|fever=yüksek ateş|cough=öksürük/öksürmek
medicine=ilaç|pill=hap|pain=ağrı/acı|hurt=acıtmak/incitmek|accident=kaza|ambulance=ambulans|blood=kan|bone=kemik
health=sağlık|healthy=sağlıklı|appointment=randevu|diet=diyet/beslenme|exercise=egzersiz|sneeze=hapşırmak|throat=boğaz
chin=çene|brain=beyin|cheek=yanak|eyebrow=kaş|wrist=bilek|toe=ayak parmağı|ankle=ayak bileği|elbow=dirsek
sore throat=boğaz ağrısı|temperature=sıcaklık/ateş (vücut)|bandage=bandaj|injury=yaralanma
rest=dinlenmek/dinlenme|sleepy=uykulu|well=iyi (sağlıklı)/kuyu|cure=tedavi etmek`,
    '✈️ Seyahat': `
passport=pasaport|luggage=bagaj|suitcase=bavul|journey=yolculuk|trip=gezi|tourist=turist|guide=rehber|abroad=yurt dışında
flight=uçuş|arrive=varmak|leave=ayrılmak/bırakmak|reservation=rezervasyon|delay=gecikme|departure=kalkış|arrival=varış
customs=gümrük|souvenir=hediyelik eşya|tent=çadır|camp=kamp|direction=yön|north=kuzey|south=güney|east=doğu|west=batı
border=sınır|coast=kıyı|desert=çöl|valley=vadi|cave=mağara|ocean=okyanus|wave=dalga/el sallamak|sunset=gün batımı
sunrise=gün doğumu|traffic=trafik|corner=köşe|petrol=benzin|wheel=tekerlek|seat=koltuk|helmet=kask|visa=vize
backpack=sırt çantası|sightseeing=gezip görme|timetable=tarife/ders programı|platform=peron|motorway=otoyol
crossroads=kavşak|single ticket=tek yön bilet|return ticket=gidiş dönüş bilet|hostel=pansiyon/hostel|view=manzara/görüş
lost=kayıp/kaybolmuş|hurry=acele etmek|on time=zamanında|miss=kaçırmak/özlemek|book=kitap/ayırtmak`,
    '🛒 Alışveriş ve para': `
price=fiyat|cost=maliyet/tutmak (fiyat)|cash=nakit|coin=madeni para|credit card=kredi kartı|receipt=fiş/makbuz
discount=indirim|sale=satış/indirim dönemi|customer=müşteri|size=beden/boyut|wallet=cüzdan|basket=sepet|bill=hesap/fatura
borrow=ödünç almak|lend=ödünç vermek|spend=harcamak|save=biriktirmek/kurtarmak|order=sipariş etmek/sipariş/düzen
choose=seçmek|compare=karşılaştırmak|deliver=teslim etmek|return=geri dönmek/iade etmek|afford=parası yetmek
rent=kira/kiralamak|salary=maaş|tax=vergi|shopping centre=alışveriş merkezi|queue=kuyruk (sıra)
department store=büyük mağaza|try on=denemek (giysi)|fit=uymak (beden)|pound=sterlin|dollar=dolar|euro=avro
bargain=kelepir/pazarlık etmek|packet=paket|online shopping=internetten alışveriş|brand=marka|gift=hediye
present=hediye/şimdiki|offer=teklif etmek/teklif|pay back=geri ödemek`,
    '🛋️ Ev hayatı': `
furniture=mobilya|carpet=halı|curtain=perde|pillow=yastık|oven=fırın (mutfak)|washing machine=çamaşır makinesi
dishwasher=bulaşık makinesi|kettle=su ısıtıcısı|pan=tava|pot=tencere|bowl=kâse|tap=musluk|sink=lavabo|garage=garaj
balcony=balkon|ceiling=tavan|housework=ev işi|rubbish=çöp|iron=ütü/demir|candle=mum|comb=tarak|toothbrush=diş fırçası
scissors=makas|tool=alet|hammer=çekiç|ladder=el merdiveni|drawer=çekmece|wardrobe=gardırop|armchair=koltuk (berjer)
sheet=çarşaf/sayfa|cushion=minder|heater=ısıtıcı|fan=vantilatör/hayran|vacuum cleaner=elektrikli süpürge
laundry=çamaşır|dust=toz|bin=çöp kutusu|gate=bahçe kapısı|fence=çit|lift=asansör/kaldırmak|downstairs=alt kat
upstairs=üst kat|address=adres|neighbourhood=mahalle|flatmate=ev arkadaşı|chores=ev işleri|plug=fiş (elektrik)`,
    '🎓 Eğitim ve meslek': `
university=üniversite|degree=diploma/derece|subject=ders (branş)/konu|science=bilim|history=tarih (bilimi)|geography=coğrafya
maths/math=matematik|art=sanat|chemistry=kimya|physics=fizik|biology=biyoloji|experiment=deney|mark=not (puan)/işaret
result=sonuç|mistake=hata|practice=pratik/alıştırma|knowledge=bilgi (birikim)|information=bilgi (haber)|idea=fikir
example=örnek|meaning=anlam|dictionary=sözlük|rule=kural|career=kariyer|company=şirket|boss=patron|manager=yönetici
meeting=toplantı|interview=mülakat/röportaj|colleague=iş arkadaşı|factory=fabrika|business=iş/ticaret|lawyer=avukat
scientist=bilim insanı|journalist=gazeteci|mechanic=tamirci|soldier=asker|firefighter=itfaiyeci|police=polis|chef=şef aşçı
photographer=fotoğrafçı|actor=erkek oyuncu|actress=kadın oyuncu|musician=müzisyen|writer=yazar|designer=tasarımcı
hairdresser=kuaför|pilot=pilot|secretary=sekreter|vet=veteriner|cleaner=temizlikçi|receptionist=resepsiyonist
term=dönem|break=teneffüs/ara/kırmak|course=kurs|pass=geçmek (sınav)|fail=başarısız olmak
project=proje|report=rapor|skill=beceri|employee=çalışan|earn=kazanmak (para)|retire=emekli olmak`,
    '📱 Teknoloji ve medya': `
website=web sitesi|email=e-posta|message=mesaj|screen=ekran|keyboard=klavye|password=şifre|download=indirmek
upload=yüklemek|online=çevrimiçi|battery=pil|charger=şarj aleti|newspaper=gazete|magazine=dergi|news=haberler
programme/program=program|channel=kanal|advertisement=reklam|machine=makine|electricity=elektrik|invention=icat
inventor=mucit|internet=internet|laptop=dizüstü bilgisayar|tablet=tablet|printer=yazıcı|button=düğme
video=video|blog=blog|search=aramak (bilgi)|click=tıklamak|type=yazmak (klavyede)/tür|delete=silmek
headphones=kulaklık|speaker=hoparlör/konuşmacı|text message=kısa mesaj|social media=sosyal medya|app=uygulama
digital=dijital|robot=robot|engine=motor|signal=sinyal`,
    '🌍 Doğa ve çevre': `
environment=çevre (doğa)|pollution=kirlilik|seed=tohum|root=kök|branch=dal/şube|wood=odun/tahta|nest=yuva (kuş)
feather=tüy|wing=kanat|tail=kuyruk|earth=dünya/toprak|planet=gezegen|space=uzay/boşluk|climate=iklim|fog=sis
thunder=gök gürültüsü|lightning=şimşek|nature=doğa|recycle=geri dönüştürmek|protect=korumak|danger=tehlike
dangerous=tehlikeli|wild=vahşi|parrot=papağan|eagle=kartal|whale=balina|squirrel=sincap|deer=geyik|mosquito=sivrisinek
worm=solucan|snail=salyangoz|cocoon=koza|volcano=yanardağ|earthquake=deprem
flood=sel|grassland=çayır|rock=kaya|soil=toprak (bahçe)|weather forecast=hava tahmini
heat=sıcaklık (ısı)|melt=erimek|freeze=donmak|shine=parlamak|bloom=çiçek açmak|harvest=hasat`,
    '🏃‍♀️ Fiiller 2': `
agree=aynı fikirde olmak|allow=izin vermek|appear=görünmek (ortaya çıkmak)|attack=saldırmak|avoid=kaçınmak|believe=inanmak
belong=ait olmak|boil=kaynatmak|break down=bozulmak|build=inşa etmek|burn=yakmak/yanmak|celebrate=kutlamak|check=kontrol etmek
collect=toplamak (biriktirmek)|complain=şikâyet etmek|continue=devam etmek|cover=örtmek|decide=karar vermek|describe=tarif etmek
destroy=yok etmek|die=ölmek|discover=keşfetmek|dream=hayal etmek/rüya|drop=düşürmek|enjoy=keyif almak|enter=girmek
escape=kaçmak|explain=açıklamak|fall=düşmek|feed=beslemek|fight=kavga etmek|fill=doldurmak|fix=tamir etmek
follow=takip etmek|guess=tahmin etmek|hate=nefret etmek|hide=saklanmak/saklamak|hit=vurmak|hold=tutmak|imagine=hayal etmek
improve=geliştirmek|introduce=tanıtmak|invite=davet etmek|join=katılmak|keep=saklamak/tutmak|kill=öldürmek|kiss=öpmek
knock=kapıyı çalmak|lie=yalan söylemek/uzanmak|marry=evlenmek|mean=anlamına gelmek|pack=bavul hazırlamak|plan=planlamak
prefer=tercih etmek|prepare=hazırlamak|promise=söz vermek|pull=çekmek|push=itmek|reach=ulaşmak|receive=teslim almak
repair=onarmak|repeat=tekrarlamak|reply=yanıtlamak|seem=gibi görünmek|share=paylaşmak|shout=bağırmak|smell=koklamak/koku
steal=çalmak (hırsızlık)|succeed=başarmak|suggest=önermek|surprise=şaşırtmak/sürpriz|taste=tatmak/tat|touch=dokunmak
translate=çevirmek (dil)|whisper=fısıldamak|worry=endişelenmek|pick up=almak (yerden)|look for=aramak (bulmaya çalışmak)
look after=bakmak (ilgilenmek)|turn on=açmak (cihaz)|turn off=kapatmak (cihaz)|put on=giymek (üstüne)|take off=çıkarmak (giysi)/kalkmak (uçak)
give up=vazgeçmek|find out=öğrenmek (ortaya çıkarmak)|grow up=büyümek (yetişkin olmak)
bake=fırında pişirmek|fry=kızartmak|mix=karıştırmak|pour=dökmek|shake=sallamak|sail=yelken açmak
wonder=merak etmek|realise/realize=fark etmek|notice=fark etmek (görmek)
expect=beklemek (ummak)|happen=olmak (gerçekleşmek)|explore=keşfe çıkmak`,
    '🌟 Sıfatlar 2': `
amazing=şaşırtıcı/muhteşem|awful=berbat|terrible=korkunç|perfect=mükemmel|famous=ünlü|popular=popüler|traditional=geleneksel
ancient=antik|special=özel|common=yaygın|rare=nadir|possible=mümkün|impossible=imkânsız|necessary=gerekli|useful=faydalı
useless=işe yaramaz|comfortable=rahat (konforlu)|uncomfortable=rahatsız|safe=güvenli|fresh=taze|spicy=baharatlı|sour=ekşi
bitter=acı (tat)|salty=tuzlu|fat=şişman|thin=ince/zayıf|curly=kıvırcık|straight=düz/dümdüz|round=yuvarlak|deep=derin
wide=geniş|narrow=dar|huge=devasa|tiny=minicik|sharp=keskin|smooth=pürüzsüz|noisy=gürültülü (kalabalık ses)|crowded=kalabalık
pleasant=hoş (keyifli)|lucky=şanslı|unlucky=şanssız|successful=başarılı|alive=canlı (hayatta)|dead=ölü|asleep=uykuda
awake=uyanık|private=özel (kişisel)|public=halka açık|international=uluslararası|national=ulusal|foreign=yabancı
local=yerel|whole=bütün (tamamı)|main=ana (temel)|real=gerçek|fair=adil|strange=garip|cute=şirin|modern=modern
excellent=mükemmel (çok iyi)|fantastic=harika (fantastik)|horrible=korkunç (iğrenç)|enormous=kocaman
fit=formda|pale=solgun|blonde=sarışın|bald=kel|beard=sakal|moustache=bıyık|elderly=yaşlı (kibar)|middle-aged=orta yaşlı
frozen=donmuş|boiled=haşlanmış|fried=kızarmış|raw=çiğ`,
    '🧭 Zaman ve bağlaçlar': `
already=zaten/çoktan|almost=neredeyse|although=-e rağmen|anywhere=herhangi bir yer|away=uzakta|during=sırasında
enough=yeterli|especially=özellikle|everywhere=her yerde|finally=sonunda|however=ancak|instead=onun yerine|just=az önce/sadece
later=daha sonra|perhaps=belki de|quickly=hızlıca|quite=oldukça|rarely=nadiren|really=gerçekten|recently=son zamanlarda
soon=yakında|still=hâlâ|suddenly=aniden|until=-e kadar|yet=henüz|while=iken|through=içinden|across=karşıdan karşıya
along=boyunca|above=yukarısında|below=aşağısında|inside=içeride|outside=dışarıda|opposite=karşısında|around=etrafında
tonight=bu gece|midnight=gece yarısı|century=yüzyıl|future=gelecek|past=geçmiş|moment=an|calendar=takvim|season=mevsim
ago=önce (zaman)|since=-den beri|ever=hiç (şimdiye kadar)|probably=muhtemelen|unfortunately=maalesef|luckily=neyse ki
so=bu yüzden|if=eğer|than=-den (karşılaştırma)|either=ikisinden biri|neither=hiçbiri|both=ikisi de|each=her biri
nobody=hiç kimse|somebody=birisi|anything=herhangi bir şey|everything=her şey|nowhere=hiçbir yerde|somewhere=bir yerde
twice=iki kez|once=bir kez|immediately=hemen|slowly=yavaşça|carefully=dikkatlice|easily=kolayca|loudly=yüksek sesle`,
    '🏛️ Toplum ve kültür': `
adult=yetişkin|teenager=genç (ergen)|member=üye|population=nüfus|citizen=vatandaş|king=kral|queen=kraliçe|prince=prens
princess=prenses|president=cumhurbaşkanı/başkan|government=hükümet|law=kanun|crime=suç|thief=hırsız|prison=hapishane
war=savaş|peace=barış|culture=kültür|tradition=gelenek|wedding=düğün|religion=din|ghost=hayalet|hero=kahraman|enemy=düşman
relationship=ilişki|couple=çift|twin=ikiz|relative=akraba|childhood=çocukluk|life=hayat|death=ölüm|age=yaş|stranger=yabancı (tanımadık)
crowd=kalabalık (insan)|festival=festival|ceremony=tören|flag=bayrak|capital=başkent|army=ordu|police station=karakol
court=mahkeme|judge=yargıç|society=toplum|volunteer=gönüllü|charity=hayır kurumu
custom=âdet|invitation=davetiye|anniversary=yıldönümü|honeymoon=balayı|funeral=cenaze`,
    '🎭 Eğlence ve spor': `
competition=yarışma|match=maç/kibrit|player=oyuncu (sporcu)|winner=kazanan|prize=ödül|race=yarış|score=skor/sayı yapmak
goal=gol/hedef|coach=antrenör/otobüs (şehirlerarası)|novel=roman|concert=konser|stage=sahne|drum=davul|violin=keman
joke=şaka|painting=tablo (resim)|fishing=balık tutma|hiking=doğa yürüyüşü|skiing=kayak|surfing=sörf|gym=spor salonu
champion=şampiyon|referee=hakem|stadium=stadyum|fan club=taraftar kulübü|board game=kutu oyunu
comedy=komedi|horror film=korku filmi|cartoon character=çizgi film karakteri|theatre/theater=tiyatro|audience=seyirci
camping=kamp yapma|photography=fotoğrafçılık|collecting=koleksiyon yapma|knitting=örgü örme|gardening=bahçecilik
adventure=macera|exhibition=sergi|ticket office=bilet gişesi|ride a horse=ata binmek|cooking=yemek yapma|rhythm=ritim`,
    '🥗 Yiyecek 2': `
flour=un|pepper=biber|garlic=sarımsak|cucumber=salatalık|lettuce=marul|bean=fasulye|pea=bezelye|mushroom=mantar
cabbage=lahana|corn=mısır|peach=şeftali|cherry=kiraz|plum=erik|apricot=kayısı|fig=incir|nut=fındık (kuruyemiş)|sausage=sosis
beef=sığır eti|lamb=kuzu|jam=reçel|sauce=sos|snack=atıştırmalık|dessert=tatlı (yemek sonu)|recipe=tarif|ingredient=malzeme
vegetarian=vejetaryen|slice=dilim|piece=parça|tin=teneke kutu|jar=kavanoz|flavour/flavor=tat (aroma)|spinach=ıspanak
eggplant/aubergine=patlıcan|melon=kavun|pineapple=ananas|coconut=hindistancevizi|almond=badem|walnut=ceviz|pancake=krep
omelette=omlet|cereal=mısır gevreği|tuna=ton balığı|seafood=deniz ürünleri|steak=biftek|bread roll=küçük ekmek
mineral water=maden suyu|lemonade=limonata|hot chocolate=sıcak çikolata|menu=menü|waitress=kadın garson|tip=bahşiş/uç
fast food=hazır yemek`,
    '👗 Giysi ve eşyalar 2': `
blouse=bluz|tie=kravat/bağlamak|slipper=terlik|earring=küpe|bracelet=bilezik|necklace=kolye|wool=yün|cotton=pamuk
leather=deri (malzeme)|silk=ipek|fashion=moda|style=tarz|collar=yaka|sleeve=giysi kolu|zip=fermuar|sandals=sandalet
trainers/sneakers=spor ayakkabı|tights=külotlu çorap|raincoat=yağmurluk|swimsuit=mayo|handbag=el çantası|purse=para kesesi
jewellery/jewelry=mücevher|perfume=parfüm|make-up=makyaj|sunglasses=güneş gözlüğü
pattern=desen|striped=çizgili|spotted=puantiyeli|plain=düz (desensiz)|tight=dar (giysi)|loose=bol (giysi)|suit=takım elbise`,
  },
};
