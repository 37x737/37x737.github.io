/* { title: '책 제목',
  author: '저자명',
  desc: '한줄소개',  // 없으면 null
  comment: '코멘트',  // 없으면 null
  tags: ['태그1', '태그2'] }, */

const genres = [
  {
    id: 'literary', label: '순문학',
    books: []
  },
  {
    id: 'fantasy', label: '판타지',
    books: []
  },
  {
    id: 'scifi', label: 'SF',
    books: [
      { title: '1984', author: '조지 오웰',
        desc: '모든 것이 감시되는 전체주의 사회를 살아가는 남자',
        comment: null,
        tags: ['디스토피아', '고전'] },
      { title: '프로젝트 헤일메리', author: '앤디 위어',
        desc: '인류를 살리기 위해 자신의 귀환을 포기한 ‘좋은 사람’의 선택은 어떤 결말을 맞을 것인가',
        comment: '영화는 안 봤는데 책은 괜찮았어',
        tags: ['우주'] },
      { title: '우리가 빛의 속도로 갈 수 없다면', author: '김초엽',
        desc: '그럼에도 불구하고 나의 세계를, 우리의 세계를 알아야겠다고 용기 내는 마음',
        comment: null,
        tags: ['우주', '유토피아'] },
    ]
  },
  {
    id: 'romance', label: '로맨스',
    books: [
      { title: '절창', author: '구병모',
        desc: '“상처는 사랑의 누룩이다.”',
        comment: '장르가 애매한데 아무리 봐도 내 눈엔 사랑이라',
        tags: [] },
      { title: '냉정과 열정 사이', author: '에쿠니 가오리, 츠지 히토나리',
        desc: '‘하나의 소설을 번갈아 가며 함께 쓰기’로 한 두 작가가 있다. 남자작가는 남자 주인공의 이야기를, 여자작가는 여자 주인공의 시선으로 쓰기로 한다. 한 회씩 번갈아 2년간 잡지에 연재한 것을 책으로 묶었다. 헤어진 연인을 가슴에 담아둔 채 각자의 삶을 사는 두 남녀의 이야기를 쓰는 동안, 두 작가는 실제로 연애하는 기분이었다고 한다.',
        comment: null,
        tags: [] },
    ]
  },
  {
    id: 'mystery', label: '추리/스릴러',
    books: [
      { title: '셜록 홈즈의 모험', author: '아서 코난 도일',
        desc: '기상천외한 미스터리와 위기 앞에서 오히려 빛을 발하는 명탐정',
        comment: null,
        tags: ['추리', '고전'] },
      { title: '용의자 X의 헌신', author: '히가시노 게이고',
        desc: null,
        comment: '무슨 설명을 해도 스포일러라... 직접 읽어야 돼',
        tags: ['추리'] },
    ]
  },
  {
    id: 'other', label: '기타',
    books: [
      { title: '서부 전선 이상 없다', author: '에리히 마리아 레마르크',
        desc: '이 책은 고발도 아니고 또 고백도 아니다. 비록 포탄은 피했다 할지라도 역시 전쟁에 의해서 파괴된 어느 시대를 보고하는 시도에 지나지 않는다.',
        comment: '이건 읽으면 영화도 봐야 돼',
        tags: ['고전', '반전(反戰)'] },
    ]
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
