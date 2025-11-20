export interface Question {
  id: string;
  question_text: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
  sample_input?: string;
  sample_output?: string;
  expected_format?: string;
}

export interface Room {
  id: string;
  topic: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  total_questions: number;
  active_users: number;
  starts_at: string;
  ends_at: string;
  status: "upcoming" | "active" | "ended";
  icon: string;
  questions: Question[];
}

// Helper function to get current time + hours
const getTimeFromNow = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

export const voomRooms: Room[] = [
  {
    id: "room-1",
    topic: "Data Structures & Algorithms",
    description: "Master fundamental DSA concepts with hands-on problems. From arrays to trees, test your algorithmic thinking!",
    difficulty: "Medium",
    total_questions: 10,
    active_users: 47,
    starts_at: getTimeFromNow(-2),
    ends_at: getTimeFromNow(22),
    status: "active",
    icon: "📊",
    questions: [
      {
        id: "q1",
        question_text: "Implement a function to reverse a linked list iteratively and recursively.",
        difficulty: "easy",
        points: 10,
        category: "Linked Lists"
      },
      {
        id: "q2",
        question_text: "Write a function to detect a cycle in a linked list using Floyd's algorithm.",
        difficulty: "medium",
        points: 20,
        category: "Linked Lists"
      },
      {
        id: "q3",
        question_text: "Implement a binary search tree with insert, search, and delete operations.",
        difficulty: "medium",
        points: 25,
        category: "Trees"
      },
      {
        id: "q4",
        question_text: "Find the kth largest element in an unsorted array without sorting.",
        difficulty: "hard",
        points: 30,
        category: "Arrays"
      },
      {
        id: "q5",
        question_text: "Implement a stack using two queues with push, pop, and top operations.",
        difficulty: "medium",
        points: 20,
        category: "Stacks & Queues"
      },
      {
        id: "q6",
        question_text: "Find the longest palindromic substring in a given string.",
        difficulty: "medium",
        points: 25,
        category: "Strings"
      },
      {
        id: "q7",
        question_text: "Implement Dijkstra's shortest path algorithm for a weighted graph.",
        difficulty: "hard",
        points: 35,
        category: "Graphs"
      },
      {
        id: "q8",
        question_text: "Solve the coin change problem using dynamic programming.",
        difficulty: "medium",
        points: 25,
        category: "Dynamic Programming"
      },
      {
        id: "q9",
        question_text: "Implement quick sort algorithm and analyze its time complexity.",
        difficulty: "medium",
        points: 20,
        category: "Sorting"
      },
      {
        id: "q10",
        question_text: "Find all permutations of a string using backtracking.",
        difficulty: "hard",
        points: 30,
        category: "Backtracking"
      }
    ]
  },
  {
    id: "room-2",
    topic: "Web Development Frontend",
    description: "Build responsive and interactive web interfaces. Master HTML, CSS, JavaScript, and modern frameworks!",
    difficulty: "Easy",
    total_questions: 8,
    active_users: 62,
    starts_at: getTimeFromNow(-3),
    ends_at: getTimeFromNow(21),
    status: "active",
    icon: "🌐",
    questions: [
      {
        id: "q1",
        question_text: "Create a responsive navigation bar with hamburger menu using HTML, CSS, and JavaScript.",
        difficulty: "easy",
        points: 10,
        category: "HTML/CSS"
      },
      {
        id: "q2",
        question_text: "Build a todo list application with add, delete, and mark complete functionality.",
        difficulty: "easy",
        points: 15,
        category: "JavaScript"
      },
      {
        id: "q3",
        question_text: "Implement a form validator that checks email format, password strength, and required fields.",
        difficulty: "medium",
        points: 20,
        category: "JavaScript"
      },
      {
        id: "q4",
        question_text: "Create a photo gallery with lightbox effect and keyboard navigation.",
        difficulty: "medium",
        points: 25,
        category: "JavaScript"
      },
      {
        id: "q5",
        question_text: "Build a countdown timer with start, pause, and reset functionality.",
        difficulty: "easy",
        points: 15,
        category: "JavaScript"
      },
      {
        id: "q6",
        question_text: "Implement infinite scroll pagination for loading content dynamically.",
        difficulty: "medium",
        points: 25,
        category: "JavaScript"
      },
      {
        id: "q7",
        question_text: "Create a dark/light theme toggle with smooth transitions and local storage persistence.",
        difficulty: "easy",
        points: 15,
        category: "CSS/JavaScript"
      },
      {
        id: "q8",
        question_text: "Build a drag-and-drop task board (like Trello) with multiple columns.",
        difficulty: "hard",
        points: 35,
        category: "JavaScript"
      }
    ]
  },
  {
    id: "room-3",
    topic: "Machine Learning Fundamentals",
    description: "Dive into ML algorithms and model building. From linear regression to neural networks!",
    difficulty: "Hard",
    total_questions: 9,
    active_users: 38,
    starts_at: getTimeFromNow(-1),
    ends_at: getTimeFromNow(23),
    status: "active",
    icon: "🤖",
    questions: [
      {
        id: "q1",
        question_text: "Implement linear regression from scratch without using sklearn. Calculate MSE and R² score.",
        difficulty: "hard",
        points: 35,
        category: "Supervised Learning"
      },
      {
        id: "q2",
        question_text: "Build a k-means clustering algorithm for customer segmentation with visualization.",
        difficulty: "hard",
        points: 40,
        category: "Unsupervised Learning"
      },
      {
        id: "q3",
        question_text: "Create a decision tree classifier from scratch and calculate accuracy, precision, recall.",
        difficulty: "medium",
        points: 30,
        category: "Classification"
      },
      {
        id: "q4",
        question_text: "Implement gradient descent optimization for logistic regression.",
        difficulty: "hard",
        points: 35,
        category: "Optimization"
      },
      {
        id: "q5",
        question_text: "Build a recommendation system using collaborative filtering.",
        difficulty: "medium",
        points: 30,
        category: "Recommendation Systems"
      },
      {
        id: "q6",
        question_text: "Implement Principal Component Analysis (PCA) for dimensionality reduction.",
        difficulty: "hard",
        points: 35,
        category: "Feature Engineering"
      },
      {
        id: "q7",
        question_text: "Create a simple neural network with one hidden layer using NumPy only.",
        difficulty: "hard",
        points: 40,
        category: "Neural Networks"
      },
      {
        id: "q8",
        question_text: "Implement cross-validation (k-fold) from scratch for model evaluation.",
        difficulty: "medium",
        points: 25,
        category: "Model Evaluation"
      },
      {
        id: "q9",
        question_text: "Build a sentiment analysis model for movie reviews using NLP techniques.",
        difficulty: "hard",
        points: 35,
        category: "NLP"
      }
    ]
  },
  {
    id: "room-4",
    topic: "Python Programming Mastery",
    description: "Enhance your Python skills with advanced concepts. Decorators, generators, async programming, and more!",
    difficulty: "Medium",
    total_questions: 10,
    active_users: 54,
    starts_at: getTimeFromNow(-4),
    ends_at: getTimeFromNow(20),
    status: "active",
    icon: "🐍",
    questions: [
      {
        id: "q1",
        question_text: "Write a decorator that measures and logs function execution time.",
        difficulty: "medium",
        points: 20,
        category: "Decorators"
      },
      {
        id: "q2",
        question_text: "Implement a context manager for database connection handling with error management.",
        difficulty: "medium",
        points: 25,
        category: "Context Managers"
      },
      {
        id: "q3",
        question_text: "Create a generator function that yields Fibonacci numbers infinitely.",
        difficulty: "easy",
        points: 15,
        category: "Generators"
      },
      {
        id: "q4",
        question_text: "Build a custom class with __getitem__, __setitem__, and __len__ magic methods.",
        difficulty: "medium",
        points: 20,
        category: "Magic Methods"
      },
      {
        id: "q5",
        question_text: "Implement a singleton pattern using metaclasses in Python.",
        difficulty: "hard",
        points: 30,
        category: "Design Patterns"
      },
      {
        id: "q6",
        question_text: "Write an async web scraper that fetches multiple URLs concurrently.",
        difficulty: "hard",
        points: 35,
        category: "Async Programming"
      },
      {
        id: "q7",
        question_text: "Create a property decorator that validates data before setting attribute values.",
        difficulty: "medium",
        points: 20,
        category: "Properties"
      },
      {
        id: "q8",
        question_text: "Implement a caching decorator using functools.lru_cache principles.",
        difficulty: "medium",
        points: 25,
        category: "Decorators"
      },
      {
        id: "q9",
        question_text: "Build a thread-safe queue implementation for producer-consumer pattern.",
        difficulty: "hard",
        points: 30,
        category: "Threading"
      },
      {
        id: "q10",
        question_text: "Create a custom iterator class that filters and transforms data on-the-fly.",
        difficulty: "medium",
        points: 20,
        category: "Iterators"
      }
    ]
  },
  {
    id: "room-5",
    topic: "Database Design & SQL",
    description: "Master database concepts and SQL queries. Normalization, optimization, and complex joins!",
    difficulty: "Medium",
    total_questions: 9,
    active_users: 41,
    starts_at: getTimeFromNow(-2),
    ends_at: getTimeFromNow(22),
    status: "active",
    icon: "🗄️",
    questions: [
      {
        id: "q1",
        question_text: "Write a SQL query to find the second highest salary from an employees table.",
        difficulty: "medium",
        points: 20,
        category: "SQL Queries"
      },
      {
        id: "q2",
        question_text: "Design a normalized database schema (3NF) for an e-commerce platform with products, orders, and users.",
        difficulty: "hard",
        points: 35,
        category: "Schema Design"
      },
      {
        id: "q3",
        question_text: "Optimize a slow query that joins 5 tables and includes subqueries. Explain your approach.",
        difficulty: "hard",
        points: 30,
        category: "Query Optimization"
      },
      {
        id: "q4",
        question_text: "Write a query to find all employees who earn more than their managers.",
        difficulty: "medium",
        points: 20,
        category: "Self Joins"
      },
      {
        id: "q5",
        question_text: "Create a stored procedure that calculates monthly sales reports with aggregations.",
        difficulty: "medium",
        points: 25,
        category: "Stored Procedures"
      },
      {
        id: "q6",
        question_text: "Implement database triggers for audit logging on INSERT, UPDATE, and DELETE operations.",
        difficulty: "hard",
        points: 30,
        category: "Triggers"
      },
      {
        id: "q7",
        question_text: "Write a complex query using window functions (ROW_NUMBER, RANK, LAG) for sales analysis.",
        difficulty: "hard",
        points: 30,
        category: "Window Functions"
      },
      {
        id: "q8",
        question_text: "Design and implement database indexes to improve query performance. Explain your choices.",
        difficulty: "medium",
        points: 25,
        category: "Indexing"
      },
      {
        id: "q9",
        question_text: "Create a recursive CTE query to traverse hierarchical data (employee-manager relationships).",
        difficulty: "hard",
        points: 30,
        category: "Recursive Queries"
      }
    ]
  },
  {
    id: "room-6",
    topic: "React & Modern JavaScript",
    description: "Build powerful React applications. Hooks, state management, performance optimization, and best practices!",
    difficulty: "Medium",
    total_questions: 10,
    active_users: 69,
    starts_at: getTimeFromNow(-3),
    ends_at: getTimeFromNow(21),
    status: "active",
    icon: "⚛️",
    questions: [
      {
        id: "q1",
        question_text: "Create a custom hook (useLocalStorage) that syncs state with browser local storage.",
        difficulty: "medium",
        points: 25,
        category: "Custom Hooks"
      },
      {
        id: "q2",
        question_text: "Build a search component with debouncing to reduce API calls.",
        difficulty: "medium",
        points: 20,
        category: "Performance"
      },
      {
        id: "q3",
        question_text: "Implement a form with validation using React Hook Form or custom logic.",
        difficulty: "easy",
        points: 15,
        category: "Forms"
      },
      {
        id: "q4",
        question_text: "Create a reusable modal component with React Portal and keyboard accessibility.",
        difficulty: "medium",
        points: 25,
        category: "Components"
      },
      {
        id: "q5",
        question_text: "Build a shopping cart with Context API for global state management.",
        difficulty: "medium",
        points: 25,
        category: "State Management"
      },
      {
        id: "q6",
        question_text: "Implement infinite scrolling with intersection observer API.",
        difficulty: "medium",
        points: 25,
        category: "Performance"
      },
      {
        id: "q7",
        question_text: "Create an authentication flow with protected routes and JWT token handling.",
        difficulty: "hard",
        points: 35,
        category: "Authentication"
      },
      {
        id: "q8",
        question_text: "Build a real-time chat component using WebSockets or Firebase.",
        difficulty: "hard",
        points: 40,
        category: "Real-time"
      },
      {
        id: "q9",
        question_text: "Optimize a slow React app using React.memo, useMemo, and useCallback.",
        difficulty: "hard",
        points: 30,
        category: "Performance"
      },
      {
        id: "q10",
        question_text: "Implement a data table with sorting, filtering, and pagination.",
        difficulty: "medium",
        points: 25,
        category: "Components"
      }
    ]
  },
  {
    id: "room-7",
    topic: "System Design & Architecture",
    description: "Design scalable systems and understand architectural patterns. From microservices to distributed systems!",
    difficulty: "Hard",
    total_questions: 8,
    active_users: 29,
    starts_at: getTimeFromNow(-1),
    ends_at: getTimeFromNow(23),
    status: "active",
    icon: "🏗️",
    questions: [
      {
        id: "q1",
        question_text: "Design a URL shortening service like bit.ly. Consider scalability, database, and collision handling.",
        difficulty: "hard",
        points: 40,
        category: "System Design"
      },
      {
        id: "q2",
        question_text: "Design a rate limiter for an API service. Explain algorithms and implementation approaches.",
        difficulty: "hard",
        points: 35,
        category: "System Design"
      },
      {
        id: "q3",
        question_text: "Design a distributed caching system like Redis. Consider consistency and availability.",
        difficulty: "hard",
        points: 45,
        category: "Distributed Systems"
      },
      {
        id: "q4",
        question_text: "Design a notification system that can send emails, SMS, and push notifications at scale.",
        difficulty: "hard",
        points: 40,
        category: "System Design"
      },
      {
        id: "q5",
        question_text: "Design a load balancer. Explain different algorithms and failure handling strategies.",
        difficulty: "hard",
        points: 35,
        category: "Infrastructure"
      },
      {
        id: "q6",
        question_text: "Design a file storage system like Google Drive. Consider sync, sharing, and versioning.",
        difficulty: "hard",
        points: 45,
        category: "System Design"
      },
      {
        id: "q7",
        question_text: "Design a real-time leaderboard system for a multiplayer game with millions of users.",
        difficulty: "hard",
        points: 40,
        category: "System Design"
      },
      {
        id: "q8",
        question_text: "Design a message queue system like RabbitMQ. Explain guarantees and failure scenarios.",
        difficulty: "hard",
        points: 45,
        category: "Distributed Systems"
      }
    ]
  },
  {
    id: "room-8",
    topic: "DevOps & Cloud Computing",
    description: "Master deployment, CI/CD, containerization, and cloud infrastructure. From Docker to Kubernetes!",
    difficulty: "Medium",
    total_questions: 9,
    active_users: 35,
    starts_at: getTimeFromNow(-2),
    ends_at: getTimeFromNow(22),
    status: "active",
    icon: "☁️",
    questions: [
      {
        id: "q1",
        question_text: "Create a Dockerfile for a Node.js application with multi-stage builds for optimization.",
        difficulty: "easy",
        points: 15,
        category: "Docker"
      },
      {
        id: "q2",
        question_text: "Write a docker-compose.yml file to orchestrate a full-stack app (frontend, backend, database).",
        difficulty: "medium",
        points: 20,
        category: "Docker Compose"
      },
      {
        id: "q3",
        question_text: "Set up a CI/CD pipeline using GitHub Actions that runs tests and deploys to production.",
        difficulty: "medium",
        points: 25,
        category: "CI/CD"
      },
      {
        id: "q4",
        question_text: "Create Kubernetes manifests (deployment, service, ingress) for deploying a web application.",
        difficulty: "hard",
        points: 35,
        category: "Kubernetes"
      },
      {
        id: "q5",
        question_text: "Write Terraform scripts to provision AWS infrastructure (EC2, RDS, S3, VPC).",
        difficulty: "hard",
        points: 35,
        category: "Infrastructure as Code"
      },
      {
        id: "q6",
        question_text: "Implement monitoring and alerting using Prometheus and Grafana for a microservices app.",
        difficulty: "hard",
        points: 30,
        category: "Monitoring"
      },
      {
        id: "q7",
        question_text: "Configure nginx as a reverse proxy with SSL/TLS certificates and load balancing.",
        difficulty: "medium",
        points: 25,
        category: "Web Servers"
      },
      {
        id: "q8",
        question_text: "Set up automated backup and disaster recovery system for a production database.",
        difficulty: "medium",
        points: 25,
        category: "Backup & Recovery"
      },
      {
        id: "q9",
        question_text: "Implement blue-green deployment strategy for zero-downtime releases.",
        difficulty: "hard",
        points: 30,
        category: "Deployment Strategies"
      }
    ]
  }
];

// Helper function to get room by ID
export const getRoomById = (roomId: string): Room | undefined => {
  return voomRooms.find(room => room.id === roomId);
};

// Helper function to get all active rooms
export const getActiveRooms = (): Room[] => {
  return voomRooms.filter(room => room.status === "active");
};

// Helper function to update room status based on current time
export const updateRoomStatuses = (): Room[] => {
  const now = new Date();
  return voomRooms.map(room => {
    const start = new Date(room.starts_at);
    const end = new Date(room.ends_at);
    
    let status: "upcoming" | "active" | "ended" = "upcoming";
    if (now >= start && now <= end) status = "active";
    else if (now > end) status = "ended";

    return { ...room, status };
  });
};
