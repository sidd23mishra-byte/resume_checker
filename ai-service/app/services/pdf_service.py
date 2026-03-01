import pdfplumber


class PDFService:

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from a PDF file
        """
        full_text = ""

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

        return full_text.strip()