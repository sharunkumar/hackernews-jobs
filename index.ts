import { $ } from "bun";

const commitChanges = async (readme: string, commitMessage: string) => {
	try {
		await $`git config user.name 'github-actions[bot]'`;
		await $`git config user.email 'github-actions[bot]@users.noreply.github.com'`;
		await $`git add ${readme}`;
		await $`git commit -m ${commitMessage}`;
		await $`git push`;
	} catch (_error) {}
};

const jobstories = await fetch(
	"https://hacker-news.firebaseio.com/v0/jobstories.json",
);

const jobstoriesdata = await Promise.all(
	((await jobstories.json()) as number[]).map(async (job) => {
		const jobdata = await fetch(
			`https://hacker-news.firebaseio.com/v0/item/${job}.json`,
		);
		return jobdata.json();
	}),
);

const markdownContent = jobstoriesdata.reduce((markdown, job) => {
	if (job.title && job.url) {
		return `${markdown}| ${job.title} | [Apply](${job.url}) |\n`;
	}
	return markdown;
}, "| Title | Apply |\n|-------|-----|\n");

const readme = "README.md";

const readmeFile = Bun.file(readme);
const readmeContent = await readmeFile.text();

const startComment = "<!-- table start -->";
const endComment = "<!-- table end -->";
const regex = new RegExp(`${startComment}[\\s\\S]*${endComment}`, "g");

// Extract existing job content
const existingContent = readmeContent.match(regex)?.[0] || "";
const existingJobs = existingContent
	.split("\n")
	.filter((line) => line.startsWith("|") && !line.startsWith("| Title"))
	.flatMap((line) => {
		const [, title] = line.match(/\| (.*?) \|/) || [];
		return title?.trim() ?? [];
	});

// Compare existing jobs with new jobs
const newJobs = jobstoriesdata.flatMap((job) =>
	job.title && job.url ? job.title : [],
);

const addedJobs = newJobs.filter((job) => !existingJobs.includes(job));
const removedJobs = existingJobs.filter((job) => !newJobs.includes(job));

const updatedContent = readmeContent.replace(
	regex,
	`${startComment}\n\n${markdownContent}\n${endComment}`,
);

Bun.write(readme, updatedContent);

console.log(`${readme} has been updated with the latest job stories.`);

const addedJobsCommitMessage = addedJobs.reduce(
	(message, job) =>
		message ? `${message}\n - ${job}` : `Added jobs:\n - ${job}`,
	"",
);

const removedJobsCommitMessage = removedJobs.reduce(
	(message, job) =>
		message ? `${message}\n - ${job}` : `Removed jobs:\n - ${job}`,
	"",
);

await commitChanges(
	readme,
	`Update Jobs

${addedJobsCommitMessage}

${removedJobsCommitMessage}
`.trim(),
);
