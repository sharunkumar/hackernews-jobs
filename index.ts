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

const readmeFile = Bun.file("README.md");
const readmeContent = await readmeFile.text();

// Replace the content between the comments
const startComment = "<!-- table start -->";
const endComment = "<!-- table end -->";
const regex = new RegExp(`${startComment}[\\s\\S]*${endComment}`);
const updatedContent = readmeContent.replace(
	regex,
	`${startComment}\n\n${markdownContent}\n${endComment}`,
);

readmeFile.writer().write(updatedContent);

console.log("README.md has been updated with the latest job stories.");
