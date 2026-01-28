const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Mock Data Store ---
const tags = [
  { id: 't1', name: 'Mathematics', color: '#ff0000' },
  { id: 't2', name: 'Algebra', color: '#00ff00' },
  { id: 't3', name: 'Geometry', color: '#0000ff' },
];

const tagGroups = [
  {
    id: 'tg1',
    name: 'Subjects',
    tags: ['t1', 't2'],
    visibility: [{ place: 'SEARCH_PAGE', position: 1 }],
  },
  {
    id: 'tg2',
    name: 'Topics',
    tags: ['t3'],
    visibility: [{ place: 'TAG_SELECT', position: 2 }],
  },
];

let learningContent = {
  id: 'c1',
  type: 'EXERCISE',
  keywords: 'math, circles',
  downloads: 12,
  likes: 5,
  tags: ['t1', 't3'],
  analytics: {
    interactions: [{ type: 'VIEW', user: 'user_1', time: Date.now() }],
    searchKeywords: ['pi', 'radius'],
  },
  relatedCollection: {
    id: 'col1',
    title: 'Geometry Basics',
    status: 'PUBLISHED',
    source: { publisher: 'EduCorp' },
    length: 1,
    author: 'Jane Doe',
    createdAt: new Date(),
    changedAt: new Date(),
    contents: [],
  },
  text: 'Calculate the area of a circle with radius 5.',
  solution: '25π',
  total_points: 10,
};

// --- Routes ---

// GET LearningContent
app.get('/api/content/:id', (req, res) => {
  res.json(learningContent);
});

// PUT LearningContent
app.put('/api/content/:id', (req, res) => {
  learningContent = { ...learningContent, ...req.body };
  res.json(learningContent);
});

// POST SearchResult
app.post('/api/search', (req, res) => {
  const { query, tags: filterTags } = req.body;
  console.log(`Searching for: "${query}" with tags:`, filterTags);

  // Returning a mock SearchResult structure
  res.json({
    exercises: { items: [learningContent], length: 1 },
    collections: { items: [learningContent.relatedCollection], length: 1 },
  });
});

// GET Tag
app.get('/api/tag/:id', (req, res) => {
  const tag = tags.find(t => t.id === req.params.id);
  tag ? res.json(tag) : res.status(404).send('Tag not found');
});

// GET TagGroup[] (with visibility and exclude filters)
app.get('/api/tag/groups', (req, res) => {
  const { visibility, exclude } = req.query;
  let filteredGroups = [...tagGroups];

  if (visibility) {
    filteredGroups = filteredGroups.filter(g => g.visibility.some(v => v.place === visibility));
  }

  if (exclude) {
    const excludeList = Array.isArray(exclude) ? exclude : [exclude];
    filteredGroups = filteredGroups.filter(g => !excludeList.includes(g.id));
  }

  res.json(filteredGroups);
});

// GET TagGroup (Single)
app.get('/api/tag/groups/:id', (req, res) => {
  const group = tagGroups.find(g => g.id === req.params.id);
  group ? res.json(group) : res.status(404).send('Group not found');
});

// --- Server Start ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Mock API running at http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  GET  /api/content/:id`);
  console.log(`  PUT  /api/content/:id`);
  console.log(`  POST /api/search`);
  console.log(`  GET  /api/tag/groups`);
});
