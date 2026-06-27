export interface MusicPreset {
  id: string;
  nameZh: string;
  nameEn: string;
  promptZh: string;
  promptEn: string;
  leadInstrument: 'guzheng' | 'flute' | 'guitar' | 'piano' | 'kalimba' | 'handpan' | 'shakuhachi';
  scaleMode: 'pentatonic_yo' | 'natural_minor' | 'pentatonic_major' | 'phrygian_latam';
  tempoBpm: number;
  fxLayer: 'rain' | 'wind_chimes' | 'campfire' | 'waves' | 'vinyl' | 'none';
  volumes: {
    lead: number;
    pad: number;
    rhythm: number;
    fx: number;
  };
  lyricsZh: string;
  lyricsEn: string;
  styleTags: string;
  lyricsTemplate: string;
}

export const MUSIC_PRESETS: Record<string, MusicPreset> = {
  lucky_deer: {
    id: 'lucky_deer',
    nameZh: '一鹿繁花 (Lucky Deer Zen)',
    nameEn: 'Deer in Bloom (Zen Sleep)',
    promptZh: '创作一段东方禅意环境微风背景音乐，带古筝与竹笛的Lo-fi敲击节拍，适合助眠、减压ASMR流媒体',
    promptEn: 'Cozy 30-second ASMR lo-fi background beat utilizing traditional Guzheng pluck notes, bamboo flute breeze, and gentle ambient vinyl crackle, suitable for meditation & stress relief video.',
    leadInstrument: 'guzheng',
    scaleMode: 'pentatonic_yo',
    tempoBpm: 72,
    fxLayer: 'rain',
    volumes: {
      lead: 0.85,
      pad: 0.60,
      rhythm: 0.40,
      fx: 0.50
    },
    lyricsZh: '[00:01] (清润古筝拂弦而起...)\n[00:03] 深沉幽静的东方宁息竹苑，晚风微醺\n[00:08] 听，雨丝轻打修竹翠篱，一鹿悠然踏花而来\n[00:12] 主打 [安静的自我疗愈] Lofi，将白昼杂音悉数洗去\n[00:15] (和声渐渐淡出，祝您今夜好梦...)',
    lyricsEn: '[00:01] (Traditional Guzheng strums rise gracefully...)\n[00:03] Deep forest of green bamboo, warm whispering evening breeze\n[00:08] The sacred deer steps, shedding off stress and daily noise\n[00:12] Ambient ASMR lo-fi chord: calibrated for deep relaxation\n[00:15] (Acoustic loop fades out into total stillness...)',
    styleTags: 'cozy mellow electronic ambient, traditional acoustic instrumentation, Guzheng Bamboo flute plucks, slow breathing lofi, cinematic background ASMR rhythm, 72 BPM, high balance, introspective calm, peaceful --no vocal',
    lyricsTemplate: '[Intro]\n(Gentle rain whisper, wooden wind chimes swaying in background)\n\n[Instrumental Solo]\n(Acoustic Guzheng chord pluck, slow, echoing, high reverb)\n\n[Verse]\n(Bamboo flute breeze slides in, soft warm sub bass pad swells)\n(Understated vintage vinyl crackle, cozy space breathing rhythm at 72 BPM)\n\n[Outro]\n(Acoustic pluck drops out, leaving pure soothing wind, fading into complete silence)\n\n[End]'
  },
  tea_ritual: {
    id: 'tea_ritual',
    nameZh: '研岩茶 (Tea Ritual ASMR)',
    nameEn: 'Sage-Brew Tea ASMR',
    promptZh: '高感官草本冥想ASMR配乐，慢速竹笛吹奏、蒸汽萦绕与温和木风铃回响，替代咖啡午后提神正念背景音',
    promptEn: 'Highly sensory organic herbal meditation background ASMR. Features slow-blown Bamboo Flute, steamy kettle heat swells, and wooden wind chimes, designed as a premium mindful coffee-alternative.',
    leadInstrument: 'flute',
    scaleMode: 'pentatonic_yo',
    tempoBpm: 60,
    fxLayer: 'wind_chimes',
    volumes: {
      lead: 0.80,
      pad: 0.70,
      rhythm: 0.20,
      fx: 0.60
    },
    lyricsZh: '[00:01] (暖色声频气泡缓缓升腾...)\n[00:03] 午后三点的温热茶杯，手心残留一丝竹叶芬芳\n[00:08] 舒压草本ASMR，宁神、舒缓、安顿身心\n[00:12] 一呼一吸之间，咖啡替代茶学冥想已合成完毕\n[00:15] (和鸣之音融入夕阳余晖中...)',
    lyricsEn: '[00:01] (Gentle warm bells ring out slow...)\n[00:03] Holding a warm cup of herbal tea, smelling the fresh bamboo and leaf\n[00:08] Coffee alternative sensory meditation: slow breathing loop engaged\n[00:12] Mindful presence: 100% neutralized, deep quietness found\n[00:15] (Sounds dissolved into soft evening horizon...)',
    styleTags: 'slow breathy bamboo flute solo, steaming water kettle ASMR, warm acoustic clay-pot resonant reverb, 60 BPM, Zen healing space, minimalist sub-base, hand-played wood blocks --no drums',
    lyricsTemplate: '[Intro]\n(Whispering steam rising, distant hollow wooden temple chime strikes)\n\n[Verse]\n(Organic bamboo flute plays a single elongated note, breathy and expressive)\n(Soft low-passed sub drone supports the melody warmly)\n\n[Chorus]\n(Slow wooden blocks rhythm, tea being poured sound effect, deep resonance)\n\n[Outro]\n(Wind chimes slowing down, flute breath fades out gently)\n\n[End]'
  },
  ebike: {
    id: 'ebike',
    nameZh: '绿色轻碳 (E-Bike City Commute)',
    nameEn: 'Aero-Commute Lo-Fi',
    promptZh: '清新欢快的城市通勤Lo-fi，轻盈木吉他、温暖低音弹拨以及微弱的黑胶摩擦噪音，营造放松自由的穿梭感',
    promptEn: 'Fresh, upbeat city-mobility lo-fi. Features crisp acoustic nylon guitar strums, warm sub-bass plucks, and vintage vinyl crackles, conveying effortless green freedom on colonial streets.',
    leadInstrument: 'guitar',
    scaleMode: 'pentatonic_major',
    tempoBpm: 85,
    fxLayer: 'vinyl',
    volumes: {
      lead: 0.75,
      pad: 0.50,
      rhythm: 0.70,
      fx: 0.35
    },
    lyricsZh: '[00:01] (轻盈的木吉他扫弦滑入...)\n[00:03] 车轮掠过落叶小径，清晨的第一缕微风拂面\n[00:08] 摆脱地铁的拥挤压迫，双腿踏出惬意的正念节奏\n[00:12] 环保低碳轻行，属于你的一英里阳光穿梭\n[00:15] (吉他渐弱，融入斑驳的光影之中...)',
    lyricsEn: '[00:01] (Crisp acoustic guitar chords gliding in...)\n[00:03] Tyres spinning on golden leaves, the first soft breath of morning wind\n[00:08] Escaping crowded subways, pacing your commute in mindful steps\n[00:12] Low-entropy eco ride: reclaim your space and ride the sunbeams\n[00:15] (Guitar notes fade out, blending into the city traffic murmurs...)',
    styleTags: 'cheerful warm acoustic nylon guitar riff, 85 BPM lo-fi hip hop drums, cozy sub-bass line, nostalgic vinyl crackle, sun-dappled happy morning, eco-friendly green ride vibe',
    lyricsTemplate: '[Intro]\n(Nostalgic vinyl dust crackle, happy birds chirping in morning street)\n\n[Verse]\n(Acoustic nylon guitar strums a warm major progression, rhythmic and sweet)\n(Soft drum kick and shaker rhythm enters at 85 BPM)\n\n[Bridge]\n(Guitar melody becomes intricate, high register plucks, sunny and bright)\n\n[Outro]\n(Drums drop out, leaving lone echoing guitar strum and record scratch)\n\n[End]'
  },
  pop_toy: {
    id: 'pop_toy',
    nameZh: '潮流玩具 (Designer Pop Toy)',
    nameEn: 'Toy Box Warmth (Cozy Desk)',
    promptZh: '独立艺术家潮玩展示背景配乐，温馨钢琴和弦、慢切打击颗粒与柴火噼啪声，传递自愈与暖心收藏陪伴',
    promptEn: 'Background soundtrack for designer toy display. Features cozy piano keys, soft electronic ticking grains, and relaxing crackling fireplace logs, delivering healing companionship.',
    leadInstrument: 'piano',
    scaleMode: 'natural_minor',
    tempoBpm: 90,
    fxLayer: 'campfire',
    volumes: {
      lead: 0.80,
      pad: 0.55,
      rhythm: 0.60,
      fx: 0.45
    },
    lyricsZh: '[00:01] (温馨的钢琴单音缓缓敲响...)\n[00:03] 窗外大雪纷飞，壁炉里的红松木噼啪作响\n[00:08] 书桌上那只沉默的潮玩公仔，投下小小的温暖影子\n[00:12] 它用温柔的圆眸，在无声中安抚你疲惫的灵魂\n[00:15] (琴声静止，炉火余温仍在蔓延...)',
    lyricsEn: '[00:01] (Warm, single piano notes chiming slowly...)\n[00:03] Heavy snow outside, crackling pinewood in the cozy fireplace\n[00:08] The quiet designer figure on your desk casting a tiny, friendly shadow\n[00:12] Watching you with non-judgmental eyes, healing your weary soul\n[00:15] (Keys slow down, fireplace warmth lingers in the quiet air...)',
    styleTags: 'cozy introspective cinematic piano chords, warm room acoustics, wood crackling fireplace sounds, relaxing down-tempo organic beats, 90 BPM, designer pop-toy showcase',
    lyricsTemplate: '[Intro]\n(Fire crackling, cozy fireplace ambience, tea steam hiss)\n\n[Verse]\n(Warm, melancholic piano chord progression starts, spacious and slow)\n(Tiny high-frequency music box bell plucks enter, sparkling like stardust)\n\n[Chorus]\n(Gently filtered lofi snare and kick pulse enters, soothing rhythm)\n\n[Outro]\n(Piano chord decays completely, pure cozy crackling fire logs, quiet sigh)\n\n[End]'
  },
  beauty_vibe: {
    id: 'beauty_vibe',
    nameZh: '东方彩妆 (DTC Beauty Vibe)',
    nameEn: 'Clean Beauty Ocean',
    promptZh: '高级纯素植物彩妆微雕展示音乐，晶莹卡林巴琴、温馨慢速和弦与潮汐起伏，尽显艺术美学画卷',
    promptEn: 'Aesthetic backing track for micro-carved botanical cosmetics. Features crystalline Kalimba tines, slow sweeping pads, and tidal ocean wave, illustrating a gallery-grade vegan canvas.',
    leadInstrument: 'kalimba',
    scaleMode: 'phrygian_latam',
    tempoBpm: 76,
    fxLayer: 'waves',
    volumes: {
      lead: 0.90,
      pad: 0.65,
      rhythm: 0.50,
      fx: 0.40
    },
    lyricsZh: '[00:01] (清透如水滴般的卡林巴琴音滑过...)\n[00:03] 潮水静静吻上海滩，微雕眼影盘散发草本清香\n[00:08] 纯素无害，零残忍的美学雕琢，画出一抹东方底色\n[00:12] 在斑驳的暮色中，每一处细节都在安静地发光\n[00:15] (琴音如水波消散，回归大海的宁静...)',
    lyricsEn: '[00:01] (Crystalline, drop-like Kalimba chords sliding...)\n[00:03] Ocean waves kissing the sand, micro-sculpted cosmetics breathing botanical scent\n[00:08] Clean, cruelty-free vegan art, sketching an elegant oriental canvas\n[00:12] In the sunset dusk, every relief detail glows with artisan pride\n[00:15] (Kalimba tines dissolve into soft rolling ocean tides...)',
    styleTags: 'sparkling kalimba tines, deep ocean waves background, slow cinematic synthesizer pads, Spanish phrygian folk progression, 76 BPM, clean beauty cosmetic luxury',
    lyricsTemplate: '[Intro]\n(Tidal sea waves rolling, soft wind breeze blowing across water)\n\n[Verse]\n(Crystal-clear Kalimba melodies play, high-pitched and shimmering)\n(Warm lush synthesized strings sweep slowly, creating depth)\n\n[Bridge]\n(Soft shaker beat joins, keeping a slow ethnic sunset groove)\n\n[Outro]\n(Kalimba plucks slow down, sound of water waves takes over, fading to silence)\n\n[End]'
  }
};
