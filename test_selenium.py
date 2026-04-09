from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

try:
    # -----------------------------------
    # 1. OPEN + LOGIN
    # -----------------------------------
    driver.get("http://localhost:5173")

    wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Admin')]"))).click()

    wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Username or Email']"))).send_keys("navadmin")
    driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys("admin123")

    driver.find_element(By.XPATH, "//button[contains(text(),'Sign In')]").click()

    # -----------------------------------
    # 2. DASHBOARD
    # -----------------------------------
    wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Dashboard')]")))
    print("✅ Dashboard")

    # -----------------------------------
    # 3. CLICK BUILDINGS (ONLY CLICK)
    # -----------------------------------
    buildings_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//text()[contains(.,'Buildings')]]"))
    )
    driver.execute_script("arguments[0].click();", buildings_btn)

    wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(),'Buildings')]")))
    print("✅ Buildings page")

    # -----------------------------------
    # 4. CHECK TABLE
    # -----------------------------------
    rows = wait.until(EC.presence_of_all_elements_located((By.XPATH, "//tbody/tr")))
    print(f"✅ Rows found: {len(rows)}")

    # -----------------------------------
    # 5. SEARCH TEST (DYNAMIC FIX)
    # -----------------------------------
    search = driver.find_element(By.XPATH, "//input[contains(@placeholder,'Search')]")

    # Get first building name dynamically
    first_name = driver.find_element(By.XPATH, "(//tbody/tr)[1]//td[1]").text
    print("Searching for:", first_name)

    search.clear()
    search.send_keys(first_name)

    wait.until(
        EC.presence_of_element_located((By.XPATH, f"//td[contains(text(),'{first_name}')]"))
    )
    print("✅ Search working")

    # -----------------------------------
    # 6. TOGGLE ACCESSIBLE
    # -----------------------------------
    toggle = wait.until(
        EC.element_to_be_clickable((By.XPATH, "(//tbody/tr)[1]//button"))
    )
    driver.execute_script("arguments[0].click();", toggle)
    print("✅ Toggle clicked")

    # -----------------------------------
    # 7. EDIT BUILDING
    # -----------------------------------
    edit_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "(//tbody/tr)[1]//button[last()]"))
    )
    driver.execute_script("arguments[0].click();", edit_btn)

    wait.until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(),'Edit Building')]"))
    )
    print("✅ Edit modal opened")

    # Close modal
    close_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//svg]"))
    )
    close_btn.click()

    # -----------------------------------
    # 8. ADD BUILDING
    # -----------------------------------
    add_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Add Building')]"))
    )
    driver.execute_script("arguments[0].click();", add_btn)

    wait.until(
        EC.presence_of_element_located((By.XPATH, "//h2[contains(text(),'Add Building')]"))
    )
    print("✅ Add modal opened")

    print("🎉 FULL CLICK FLOW SUCCESSFUL")

finally:
    driver.quit()