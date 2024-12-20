class Job {
  // Constructor for initializing a Job object with necessary attributes
  constructor(jobNo, title, link, postedTime, type, level, estimatedTime, skill, detail) {
    this.jobNo = jobNo;
    this.title = title; // Job title
    this.link = link; // URL link to job page
    this.postedTime = postedTime; // How recently the job was posted
    this.type = type; // Type of job (e.g., full-time, part-time)
    this.level = level; // Job level (e.g., entry, senior)
    this.estimatedTime = estimatedTime; // Estimated completion time
    this.skill = skill; // Required skill for the job
    this.detail = detail; // Additional details about the job
  }

  // Method to return a formatted string of job details as HTML
  getDetails() {
    return `
      <h3>${this.title}</h3>
      <p><strong>Posted:</strong> ${this.getFormattedPostedTime()}</p>
      <p><strong>Type:</strong> ${this.type}</p>
      <p><strong>Level:</strong> ${this.level}</p>
      <p><strong>Estimated Time:</strong> ${this.estimatedTime}</p>
      <p><strong>Skill:</strong> ${this.skill}</p>
      <p><strong>Detail:</strong> ${this.detail}</p>
      <p><a href="${this.link}" target="_blank">View Job</a></p>
    `;
  }

  // Static method to convert posted time string into minutes
  static parsePostedTime(postedTime) {
    const [value, unit] = postedTime.split(' '); // Split the time and unit
    const multiplier = unit.includes('minute') ? 1 : unit.includes('hour') ? 60 : 1440; // Determine multiplier
    return parseInt(value) * multiplier; // Convert to minutes
  }

  // Method to return a user-friendly formatted posted time
getFormattedPostedTime() {
  const [value, unit] = this.postedTime.split(' '); // Split the time and unit
  const plural = parseInt(value) > 1 ? 's' : ''; // Add 's' for plural units
  return `${value} ${unit}${plural}`; // Return the formatted string
}

  // Static method to sort jobs alphabetically by title
  static sortByTitle(jobs, ascending = true) {
    return jobs.sort((a, b) =>
      ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    );
  }

  // Static method to sort jobs based on posting time (oldest to newest)
  static sortByPostedTime(jobs, oldestFirst = true) {
    return jobs.sort((a, b) =>
      oldestFirst
        ? Job.parsePostedTime(a.postedTime) - Job.parsePostedTime(b.postedTime)
        : Job.parsePostedTime(b.postedTime) - Job.parsePostedTime(a.postedTime)
    );
  }
}

let jobs = []; // Array to hold Job objects

// Event listener for loading data from a file
document.getElementById('loadData').addEventListener('click', () => {
  const fileInput = document.getElementById('upload'); // Get file input
  const file = fileInput.files[0]; // Select first file

  if (file) {
    const reader = new FileReader(); // Initialize file reader
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result); // Parse the file content
        jobs = data.map(job => new Job(
          job["Job No"], // Parse job number
          job["Title"], // Parse job title
          job["Job Page Link"], // Parse link
          job["Posted"], // Parse posted time
          job["Type"], // Parse job type
          job["Level"], // Parse job level
          job["Estimated Time"], // Parse estimated time
          job["Skill"], // Parse skill
          job["Detail"] // Parse detail
        ));
        displayJobs(jobs); // Display the loaded jobs
        populateFilters(jobs); // Populate the filter options
      } catch (error) {
        alert("Invalid JSON format"); // Error if the file isn't valid JSON
      }
    };
    reader.readAsText(file); // Read the file content as text
  } else {
    alert("Please upload a JSON file"); // Alert if no file is uploaded
  }
});

// Function to display the list of jobs
function displayJobs(jobs) {
  const list = document.getElementById('list'); // Get the jobs container
  list.innerHTML = jobs.map(job => `
    <div class="job">
      <h3>${job.title}</h3>
      <p>Posted: ${job.postedTime}</p>
      <p>Type: ${job.type}</p>
      <p>Level: ${job.level}</p>
      <button onclick="toggleDetails('${job.jobNo}')">View Details</button>
      <div class="job-details" id="details-${job.jobNo}" style="display: none;">
        ${job.getDetails()}
      </div>
    </div>
  `).join(''); // Append job HTML to the container
}

// Toggles the visibility of job details
function toggleDetails(jobNo) {
  const detailsDiv = document.getElementById(`details-${jobNo}`);
  const isVisible = detailsDiv.style.display === 'block'; // Check if currently visible
  detailsDiv.style.display = isVisible ? 'none' : 'block'; // Toggle display
}

// Populates filter dropdowns with unique values
function populateFilters(jobs) {
  const levels = [...new Set(jobs.map(job => job.level))]; // Unique levels
  const types = [...new Set(jobs.map(job => job.type))]; // Unique types
  const skills = [...new Set(jobs.map(job => job.skill))]; // Unique skills

  populateDropdown('levelFilter', levels); // Populate level filter
  populateDropdown('typeFilter', types); // Populate type filter
  populateDropdown('skillFilter', skills); // Populate skill filter
}

// Helper function to populate a dropdown with options
function populateDropdown(id, options) {
  const dropdown = document.getElementById(id); // Get dropdown element
  dropdown.innerHTML = '<option value="">All</option>' + options.map(option => `
    <option value="${option}">${option}</option>
  `).join(''); // Add options to dropdown
}

// Event listeners for filters
document.getElementById('levelFilter').addEventListener('change', filterJobs);
document.getElementById('typeFilter').addEventListener('change', filterJobs);
document.getElementById('skillFilter').addEventListener('change', filterJobs);

// Filters jobs based on selected criteria
function filterJobs() {
  const level = document.getElementById('levelFilter').value; // Get selected level
  const type = document.getElementById('typeFilter').value; // Get selected type
  const skill = document.getElementById('skillFilter').value; // Get selected skill

  const filtered = jobs.filter(job =>
    (!level || job.level === level) && // Filter by level
    (!type || job.type === type) && // Filter by type
    (!skill || job.skill === skill) // Filter by skill
  );
  displayJobs(filtered); // Display filtered jobs
}

// Event listener for applying sorting
document.getElementById('applySort').addEventListener('click', () => {
  const sortOption = document.getElementById('sortDropdown').value; // Get sort option

  // Filter jobs first based on current filters
  const level = document.getElementById('levelFilter').value; // Get selected level
  const type = document.getElementById('typeFilter').value; // Get selected type
  const skill = document.getElementById('skillFilter').value; // Get selected skill

  let filteredJobs = jobs.filter(job =>
    (!level || job.level === level) && // Filter by level
    (!type || job.type === type) && // Filter by type
    (!skill || job.skill === skill) // Filter by skill
  );

  // Sort the filtered jobs
  switch (sortOption) {
    case 'titleAsc': // Sort titles ascending
      filteredJobs = Job.sortByTitle(filteredJobs, true);
      break;
    case 'titleDesc': // Sort titles descending
      filteredJobs = Job.sortByTitle(filteredJobs, false);
      break;
    case 'postedNew': // Sort newest first
      filteredJobs = Job.sortByPostedTime(filteredJobs, true);
      break;
    case 'postedOld': // Sort oldest first
      filteredJobs = Job.sortByPostedTime(filteredJobs, false);
      break;
    default:
      alert('Please select a valid sorting option'); // Alert for invalid sort
      return;
  }

  displayJobs(filteredJobs); // Display the filtered and sorted jobs
});
