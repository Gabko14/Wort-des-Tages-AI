from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to localhost:8081...")
            # Wait for server to be up (retry a few times)
            for i in range(20):
                try:
                    page.goto("http://localhost:8081", timeout=5000)
                    print("Page loaded.")
                    break
                except Exception as e:
                    print(f"Attempt {i+1} failed: {e}")
                    time.sleep(2)

            # Wait for content to load
            time.sleep(15)

            # Take a screenshot
            page.screenshot(path="verification/verification.png")
            print("Screenshot taken at verification/verification.png")

            # Print page title
            print(f"Page title: {page.title()}")

        except Exception as e:
            print(f"Script failed: {e}")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
