const genres = [
  {
    id: 'literary', label: '순문학',
    books: [
      { title: '채식주의자', author: '한강',
        desc: '폭력과 꿈, 침묵으로 저항하는 한 여자의 이야기.',
        comment: '읽고 나서 한동안 멍했다.',
        tags: ['한국소설', '수상작', '강렬함'] },
      { title: '노르웨이의 숲', author: '무라카미 하루키',
        desc: '사라진 사람들 사이에서 살아남은 자의 기억.',
        comment: null,
        tags: ['일본소설', '성장', '상실'] },
      { title: '파친코', author: '이민진',
        desc: '재일 조선인 가족 4대의 삶을 그린 대하소설.',
        comment: '묵직하고 아름답다. 오래 기억에 남는 책.',
        tags: ['역사', '가족', '디아스포라'] },
    ]
  },
  {
    id: 'fantasy', label: '판타지',
    books: [
      { title: '이름의 바람', author: '패트릭 로스퍼스',
        desc: '전설적인 마법사 코테가 자신의 일생을 직접 이야기한다.',
        comment: '1권인데 완결이 아직도 안 났다는 게 함정.',
        tags: ['서양판타지', '성장서사', '마법'] },
      { title: '나이트서커스', author: '에린 모겐스턴',
        desc: '밤에만 열리는 검은 천막 서커스, 그 안의 마법 대결.',
        comment: null,
        tags: ['분위기 소설', '로맨스', '마법'] },
    ]
  },
  {
    id: 'scifi', label: 'SF',
    books: [
      { title: '솔라리스', author: '스타니스와프 렘',
        desc: '인간의 언어로는 설명할 수 없는 존재와의 접촉.',
        comment: '읽는 내내 불편하고 그래서 좋았다.',
        tags: ['고전SF', '철학적', '외계'] },
      { title: '1984', author: '조지 오웰',
        desc: '모든 것이 감시되는 전체주의 사회를 살아가는 한 남자.',
        comment: null,
        tags: ['디스토피아', '고전', '정치'] },
    ]
  },
  {
    id: 'romance', label: '로맨스',
    books: [
      { title: '오만과 편견', author: '제인 오스틴',
        desc: '계층과 편견을 넘는 엘리자베스와 다아시의 사랑.',
        comment: '시간이 지나도 전혀 안 질린다.',
        tags: ['고전', '영국소설', '계층'] },
    ]
  },
  {
    id: 'mystery', label: '추리/스릴러',
    books: [
      { title: '그리고 아무도 없었다', author: '애거사 크리스티',
        desc: '외딴 섬에 모인 열 명, 한 명씩 죽어간다.',
        comment: '지금 읽어도 충격적인 반전.',
        tags: ['밀실추리', '고전', '반전'] },
      { title: '나는 고백한다', author: '자우메 카브레',
        desc: '세 시대를 관통하는 한 남자의 고백과 죄의 기록.',
        comment: null,
        tags: ['스페인소설', '역사', '심리'] },
    ]
  },
  {
    id: 'other', label: '기타',
    books: []
  },
];

let currentGenre = genres[0].id;
let activeTag = null;

function renderSidebar() {
  document.getElementById('sidebar').innerHTML = genres.map(g => `
    <div class="genre-tab ${g.id === currentGenre ? 'active' : ''}"
         onclick="switchGenre('${g.id}')">
      <span>${g.label}</span>
      <span class="count">${g.books.length}</span>
    </div>
  `).join('');

  document.getElementById('mobileBarInner').innerHTML = genres.map(g => `
    <div class="mobile-tab ${g.id === currentGenre ? 'active' : ''}"
         onclick="switchGenre('${g.id}')">
      ${g.label}
    </div>
  `).join('');
}

function renderMain() {
  const genre = genres.find(g => g.id === currentGenre);

  const visibleBooks = activeTag
    ? genre.books.filter(b => (b.tags || []).includes(activeTag))
    : genre.books;

  const cardsHtml = visibleBooks.length
    ? visibleBooks.map((b, i) => {
        const commentHtml = b.comment ? `
          <div class="book-comment">
            <span class="comment-text">${b.comment}</span>
          </div>` : '';
        const tagsHtml = (b.tags && b.tags.length) ? `
          <div class="book-tags">
            ${b.tags.map(t => `
              <span class="tag ${activeTag === t ? 'active' : ''}"
                    onclick="toggleTag('${t}')">${t}</span>
            `).join('')}
          </div>` : '';
        return `
          <div class="book-card" style="animation-delay:${i * 0.05}s">
            <div class="book-info">
              <div class="book-title">${b.title}</div>
              <div class="book-author">${b.author}</div>
              ${b.desc ? `<div class="book-desc">${b.desc}</div>` : ''}
              ${commentHtml}
              ${tagsHtml}
            </div>
          </div>`;
      }).join('')
    : `<div class="empty-state">해당 태그의 책이 없습니다.</div>`;

  document.getElementById('main').innerHTML = `
    <div class="section-header">
      <h2>${genre.label}</h2>
    </div>
    <div class="book-grid">${cardsHtml}</div>
  `;
}

function switchGenre(id) {
  currentGenre = id;
  activeTag = null;
  renderSidebar();
  renderMain();
}

function toggleTag(tag) {
  activeTag = (activeTag === tag) ? null : tag;
  renderMain();
}

renderSidebar();
renderMain();
