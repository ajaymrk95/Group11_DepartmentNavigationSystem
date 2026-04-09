from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time



BASE_URL = "http://localhost:5173"

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 12)

def close_modal_if_open():
    overlays = driver.find_elements(By.XPATH, "//div[contains(@style,'position: fixed')]")

    if overlays:
        from selenium.webdriver.common.keys import Keys
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ESCAPE)
        print("⚠️ Modal closed")
# ─────────────────────────────────────────────
# UTIL FUNCTIONS
# ─────────────────────────────────────────────
def wait_for_page(url_part):
    wait.until(EC.url_contains(url_part))


def click(xpath):
    wait.until(EC.element_to_be_clickable((By.XPATH, xpath))).click()


def type_text(xpath, text):
    el = wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
    el.clear()
    el.send_keys(text)


# ─────────────────────────────────────────────
# 1. LOGIN
# ─────────────────────────────────────────────
def login():
    driver.get("http://localhost:5173/login")

    type_text("//input[@type='text']", "navadmin")
    type_text("//input[@type='password']", "tarunscene")

    login_btn = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//button[@type='submit']")
    ))
    login_btn.submit()

# wait for redirect
    try:
        wait.until(lambda d: "/admin" in d.current_url)
        print("✅ Login successful")
        print("Redirected to:", driver.current_url)
    except:
        print("❌ Login failed or redirect not happening")
        print("Current URL:", driver.current_url)

# ─────────────────────────────────────────────
# 2. NAVIGATE TO BUILDINGS
# ─────────────────────────────────────────────
def go_to_buildings():
    driver.get(f"{BASE_URL}/admin/buildings")
    wait.until(EC.presence_of_element_located((By.XPATH, "//table")))
    print("✅ Buildings page loaded")


# ─────────────────────────────────────────────
# 3. SEARCH BUILDINGS
# ─────────────────────────────────────────────
def search_building(name):
    type_text("//input[contains(@placeholder,'Search')]", name)
    time.sleep(1)
    print(f"✅ Searched for: {name}")


# ─────────────────────────────────────────────
# 4. ADD BUILDING
# ─────────────────────────────────────────────
def add_building():
    close_modal_if_open()

    # wait until overlay gone
    wait.until(EC.invisibility_of_element_located(
        (By.XPATH, "//div[contains(@style,'position: fixed')]")
    ))

    # click add button safely
    btn = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(),'Add Building')]")
    ))
    driver.execute_script("arguments[0].click();", btn)

    print("✅ Opened Add Building modal")

    # fill form
    type_text("//input[@placeholder='e.g. ELHC']", "CSED")
    type_text("//input[@type='number']", "1")

    type_text("//textarea", "Computer Science and Engineering Department")

    type_text("//input[contains(@placeholder,'lab')]", "computer science,engineering")

    # geojson
    geom = '''{"type":"Polygon","coordinates":[[[75.93,11.32],[75.94,11.32],[75.94,11.33],[75.93,11.33],[75.93,11.32]]]}'''
    type_text("//textarea[contains(@placeholder,'MultiPolygon')]", geom)

    # submit
    save_btn = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//button[contains(text(),'Add Building')]")
    ))
    driver.execute_script("arguments[0].click();", save_btn)

    print("✅ Building added")


# ─────────────────────────────────────────────
# 5. EDIT BUILDING
# ─────────────────────────────────────────────
def edit_first_building():
    click("(//tbody/tr//button//*[name()='svg'])[1]")

    # update name
    type_text("//input[@placeholder='e.g. ELHC']", "Updated Building")

    click("//button[contains(text(),'Save Changes')]")

    print("✅ Building edited")


# ─────────────────────────────────────────────
# 6. TOGGLE ACCESSIBILITY
# ─────────────────────────────────────────────
def toggle_all_buildings():
    toggles = wait.until(EC.presence_of_all_elements_located(
        (By.XPATH, "//tbody/tr//button")
    ))

    for i, btn in enumerate(toggles):
        try:
            btn.click()
            print(f"✅ Toggled building {i+1}")
            time.sleep(0.5)
        except:
            print(f"⚠️ Failed toggle {i+1}")


# ─────────────────────────────────────────────
# 7. NEGATIVE TEST (INVALID LOGIN)
# ─────────────────────────────────────────────
def invalid_login():
    driver.get(f"{BASE_URL}/login")

    type_text("//input[@type='text']", "wrong")
    type_text("//input[@type='password']", "wrong")

    click("//button[contains(text(),'Sign In')]")

    try:
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(text(),'Invalid')]")
        ))
        print("✅ Invalid login test passed")
    except TimeoutException:
        print("❌ Invalid login test failed")


# ─────────────────────────────────────────────
# 8. DELETE BUILDING (optional)
# ─────────────────────────────────────────────
def delete_first_building():
    try:
        click("(//tbody/tr//button)[last()]")
        print("✅ Delete clicked")
    except:
        print("⚠️ Delete not found")


# ─────────────────────────────────────────────
# MAIN EXECUTION
# ─────────────────────────────────────────────
try:
    login()
    go_to_buildings()

    search_building("Test")
    add_building()

    time.sleep(2)

    edit_first_building()
    toggle_all_buildings()

    # negative test
    invalid_login()

finally:
    time.sleep(3)
    driver.quit()