class MarkdownNormalizer:

    def normalizer(
            self,
            markdown : str
    ) -> str:

        markdown = markdown.replace(
            "\r\n",
            "\n"
        )

        lines = [
            line.rstrip()
            for line in markdown.split("\n")
        ]

        cleaned = []

        previous_blank = False

        for line in lines:

            blank = not line.strip()

            if blank and previous_blank:
                continue

            cleaned.append(line)

            previous_blank = blank

        return "\n".join(cleaned).strip()