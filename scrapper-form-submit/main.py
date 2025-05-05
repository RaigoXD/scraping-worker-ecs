import typer

from playwright.sync_api import Playwright, sync_playwright

# read csv_from_s3 function
from read_csv import read_csv_from_s3


import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def run(playwright: Playwright, rows: list[dict], param_headless: bool) -> None:
    logger.info(f"Starting browser in {'headless' if param_headless else 'visible'} mode")
    browser = playwright.chromium.launch(headless=param_headless)

    context = browser.new_context()
    page = context.new_page()
    
    url = "https://la-fiestica-form.vercel.app/"
    logger.info(f"Navigating to {url}")
    page.goto(url)

    logger.info(f"Processing {len(rows)} entries from CSV")
    for i, row in enumerate(rows, 1):
        logger.info(f"Processing entry {i}/{len(rows)}: {row['name']}")
        _name = row['name'] 
        _food_preferences = row['bring']
        _parcipate_in_hackathon = True if row["participate in hackathon"] == "Yes" else False
        _arrival_time = row['arrival time'] 
        _comments = row["comments"]

        # Fill the name field
        logger.debug(f"Filling name field: {_name}")
        page.locator("#name").fill(_name)

        # Fill the food preferences
        page.locator("#bring_something").select_option(_food_preferences)

        # Fill participate in the hackathon field
        if _parcipate_in_hackathon:
            page.get_by_role("checkbox", name="¿Participas en el hackathon?").check()

        # Arrival time field
        page.locator("#arrival_time").fill(_arrival_time)

        # Fill the comments field
        page.locator("#comments").fill(_comments)

        # you are a bot field
        page.get_by_role("checkbox", name="¿Eres un bot?").check()
        
        # Click the submit button
        page.get_by_role("button", name="Registrarse").click()
        
        # Wait for the success message
        page.wait_for_selector("text=¡Gracias por registrarte! Juan te espera con los brazos abiertos.")
        logger.info(f"Successfully submitted entry for {_name}")
        
        logger.debug("Reloading page for next entry")
        page.reload()

    # ---------------------
    context.close()
    browser.close()


def main(bucket_name: str, file_key: str, headless: bool = True) -> None: 

    # command --> python main.py bk-aws-scrapper-test data_party/data.csv --no-headless
    # command --> python main.py bk-aws-scrapper-test data_party/data.csv --headless

    _bucket_name = bucket_name
    _file_key = file_key
    print(headless)
    
    logger.info(f"Reading CSV from S3 bucket: {_bucket_name}, file: {_file_key}")
    rows = read_csv_from_s3(_bucket_name, _file_key)
    logger.info(f"Successfully read {len(rows)} rows from CSV")

    with sync_playwright() as playwright:
        run(playwright, rows, headless)
    
    logger.info("Script execution completed successfully")


if __name__ == "__main__":
    typer.run(main)