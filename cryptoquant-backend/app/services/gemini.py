from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client()

# 1. First turn
interaction1 = client.interactions.create(
    model="gemini-2.5-flash",
    input="안녕 내 이름은 철수야"
)
print(f"Model: {interaction1.outputs[-1].text}")

# 2. Second turn (passing previous_interaction_id)
interaction2 = client.interactions.create(
    model="gemini-2.5-flash",
    input="내 이름이 뭐라고?",
    previous_interaction_id=interaction1.id
)
print(f"Model: {interaction2.outputs[-1].text}")
# from google import genai

# client = genai.Client(api_key="직접 발급받은 API KEY")

# response = client.models.generate_content(
#     model="gemini-2.0-flash", contents="Explain how AI works in a few words"
# )
# print(response.text)