import { readFileSync, writeFileSync } from 'fs';

const jobstories = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json')

const jobstoriesdata = await Promise.all((await jobstories.json() as number[]).map(async (job) => {
  const jobdata = await fetch(`https://hacker-news.firebaseio.com/v0/item/${job}.json`)
  return jobdata.json()
}))

const generateMarkdown = (data: any[]) => {
  let markdown = '|-------|-----|\n';
  data.forEach((job) => {
    if (job.title && job.url) {
      markdown += `| ${job.title} | [Apply](${job.url}) |\n`;
    }
  });
  return markdown;
};

const markdownContent = generateMarkdown(jobstoriesdata);

// Read the existing README.md file
const readmePath = 'README.md';
let readmeContent = readFileSync(readmePath, 'utf-8');

// Replace the content between the comments
const startComment = '<!-- table start -->';
const endComment = '<!-- table end -->';
const regex = new RegExp(`${startComment}[\\s\\S]*${endComment}`);
const updatedContent = readmeContent.replace(regex, `${startComment}\n\n${markdownContent}\n${endComment}`);

// Write the updated content back to README.md
writeFileSync(readmePath, updatedContent);

console.log('README.md has been updated with the latest job stories.');
