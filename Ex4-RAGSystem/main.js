// 1. استيراد المكتبات وضبط متغيّرات البيئة
import fs from 'fs';
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as dotenv from "dotenv";
dotenv.config();  // يحمّل مفاتيح API والمتغيّرات من .env



// 2. قراءة الملف وتحويله لـ Document واحد
const loadDocuments = () => {
  const text = fs.readFileSync("./Ex4-RAGSystem/article.txt", 'utf8');
  return [ new Document({ pageContent: text }) ];
};



// 3. تقسيم النصّ الكبير لإنمُذجات وتخزينها في FAISS
const createVectorStore = async (documents) => {
  // 3.1 تقسيم النصّ لقطع صغيرة
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  const chunks = await splitter.splitDocuments(documents);
  console.log(`Split into ${chunks.length} chunks`);

  // 3.2 توليد الـ embeddings وحفظها في FAISS
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await FaissStore.fromDocuments(chunks, embeddings);
  console.log("Vector store created successfully");

  return vectorStore;
};



// 4. دالة تنسيق المستندات المجلوبة من الـ retriever
const formatDocumentsAsString = (docs) => {
  // بتدمج مصفوفة docs في نص واحد بفاصل سطرين
  return docs.map(doc => doc.pageContent).join('\n\n');
};



// 5. تجهيز سلسلة الـ RAG (جلب + قالب + موديل + إخراج)
const setupRagChain = (vectorStore) => {
  // 5.1 Retriever: يجيب أفضل 2 قطع مناسبة للسؤال
  const retriever = vectorStore.asRetriever(2);

  // 5.2 قالب السؤال مع السياق
  const prompt = PromptTemplate.fromTemplate(`
    Answer the question based only on the following context:
    {context}

    Question: {question}
  `);

  // 5.3 موديل ChatOpenAI
  const model = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.2 });

  // 5.4 ربط كل شيء في RunnableSequence
  const ragChain = RunnableSequence.from([
    {
      // أولاً: خذ السؤال، جيب المستندات القريبة وحولها لنص واحد
      context: async (input) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        return formatDocumentsAsString(docs);
      },
      // ثانياً: السؤال نفسه
      question: (input) => input.question,
    },
    prompt,                // ثالثاً: املأ القالب بالسياق والسؤال
    model,                 // رابعاً: ارسل للنموذج عشان يولد الجواب
    new StringOutputParser() // خامساً: طوّر الناتج لنص جاهز
  ]);

  return ragChain;
};



// 6. الدالة الرئيسيّة اللي تشغّل كل الكود
const main = async () => {
  // تحميل المستند
  console.log("Loading documents...");
  const documents = loadDocuments();

  // إنشاء الـ vector store
  console.log("Creating vector store...");
  const vectorStore = await createVectorStore(documents);

  // إعداد سلسلة RAG
  console.log("Setting up RAG chain...");
  const ragChain = setupRagChain(vectorStore);

  // طرح سؤال وتشغيل السلسلة
  console.log("\nAsk a question:");
  const question = "What is Machine learning?";
  console.log(`Question: ${question}`);

  const answer = await ragChain.invoke({ question });
  console.log(`Answer: ${answer}`);
};

// 7. نفّذ الدالة main
main();