# ============================================================================
# GitHub Issues Hierarchy Creator with Dry-Run Support (GitHub CLI)
# Creates Epic → Feature → Story hierarchy from JSON
# ============================================================================

#-----------------------------------------------------

# gh auth login
# gh repo clone internkalamtech/IMS
# gh auth refresh --hostname github.com -s repo,project
# gh auth refresh --hostname github.com -s project
# gh auth refresh --hostname github.com -s read:project
# gh auth refresh --hostname github.com -s read:IMS
# gh auth refresh -s project

#-----------------------------------------------------

# ------------- CONFIG ----------------
$DRY_RUN = $false             # 🔁 SET TO $false TO EXECUTE FOR REAL
$ISSUES_FILE = "./requirements/f_issues.json"
$PROJECT_NUMBER = 4          # GitHub Project v2 number
$OWNER = "internkalamtech"   # user or org
$REPO = "IMS"                # ⚠️ ADD YOUR REPO NAME HERE
$AUTO_CREATE_LABELS = $true  # 🏷️ Automatically create missing labels
# -------------------------------------

# ------------- GLOBALS ----------------
$Script:IssueMap = @{}  # Track created issues: title -> number
$Script:SimCounter = 1000  # For dry-run simulation

# ------------- CONSOLE LOGGING ----------------
function Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colors = @{
        "INFO"    = "White"
        "SUCCESS" = "Green"
        "WARN"    = "Yellow"
        "ERROR"   = "Red"
        "DRY-RUN" = "Cyan"
    }
    
    $color = if ($colors.ContainsKey($Level)) { $colors[$Level] } else { "White" }
    Write-Host "[$timestamp][$Level] $Message" -ForegroundColor $color
}

# ------------- GITHUB CLI HELPERS ----------------
function Test-GitHubCLI {
    try {
        $null = gh --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log "GitHub CLI found" "SUCCESS"
            return $true
        }
        Log "GitHub CLI (gh) not found. Please install from https://cli.github.com/" "ERROR"
        return $false
    }
    catch {
        Log "GitHub CLI (gh) not found. Please install from https://cli.github.com/" "ERROR"
        return $false
    }
}

function Test-GitHubAuth {
    try {
        $status = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Log "GitHub CLI authenticated" "SUCCESS"
            return $true
        }
        Log "GitHub CLI not authenticated. Run: gh auth login" "ERROR"
        return $false
    }
    catch {
        Log "Failed to check GitHub auth status" "ERROR"
        return $false
    }
}

function Get-UniqueRandomColor {
    param([hashtable]$UsedColors)
    
    # Predefined nice colors
    $niceColors = @(
        "8B5CF6", "3B82F6", "06B6D4", "10B981", "F59E0B", "EF4444",
        "EC4899", "A855F7", "0EA5E9", "14B8A6", "F97316", "84CC16",
        "EAB308", "6366F1", "8B5A00", "8B008B", "0052CC", "00875A",
        "FF5630", "6554C0"
    )
    
    # Try predefined colors first
    foreach ($color in $niceColors) {
        if (-not $UsedColors.ContainsKey($color.ToUpper())) {
            $UsedColors[$color.ToUpper()] = $true
            return $color
        }
    }
    
    # Generate random colors if all predefined ones are used
    $maxAttempts = 100
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $r = Get-Random -Minimum 50 -Maximum 230
        $g = Get-Random -Minimum 50 -Maximum 230
        $b = Get-Random -Minimum 50 -Maximum 230
        $color = "{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
        
        if (-not $UsedColors.ContainsKey($color.ToUpper())) {
            $UsedColors[$color.ToUpper()] = $true
            return $color
        }
        $attempt++
    }
    
    return "9CA3AF"  # Fallback gray
}

function Ensure-Labels {
    param([array]$RequiredLabels)
    
    if (-not $AUTO_CREATE_LABELS) {
        Log "Label auto-creation disabled" "INFO"
        return
    }
    
    Log "Checking and creating missing labels..." "INFO"
    
    if ($DRY_RUN) {
        Log "DRY-RUN: Would check and create missing labels" "DRY-RUN"
        Log "  Labels needed: $($RequiredLabels -join ', ')" "DRY-RUN"
        return
    }
    
    # Get existing labels
    $existingLabels = @{}
    $usedColors = @{}
    
    try {
        $existingLabelsList = gh label list --repo "$OWNER/$REPO" --json name,color | ConvertFrom-Json
        foreach ($label in $existingLabelsList) {
            $existingLabels[$label.name] = $label.color
            $usedColors[$label.color.ToUpper()] = $true
        }
        Log "  Repository has $($existingLabels.Count) existing labels" "INFO"
    }
    catch {
        Log "  Warning: Could not fetch existing labels" "WARN"
    }
    
    # Create missing labels
    $createdCount = 0
    foreach ($label in $RequiredLabels) {
        if (-not $existingLabels.ContainsKey($label)) {
            $color = Get-UniqueRandomColor -UsedColors $usedColors
            $description = "Auto-created by import script"
            
            try {
                gh label create $label --repo "$OWNER/$REPO" --color $color --description $description --force 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Log "  ✓ Created label: '$label' (#$color)" "SUCCESS"
                    $createdCount++
                }
            }
            catch {
                Log "  ✗ Error creating label '$label'" "WARN"
            }
            
            Start-Sleep -Milliseconds 100
        }
    }
    
    if ($createdCount -gt 0) {
        Log "Successfully created $createdCount new label(s)" "SUCCESS"
    }
    else {
        Log "All required labels already exist" "SUCCESS"
    }
}

function Collect-AllLabels {
    param([object]$Epic)
    
    $allLabels = @()
    
    # Epic labels
    if ($Epic.labels) {
        $allLabels += $Epic.labels
    }
    
    # Feature labels
    if ($Epic.features) {
        foreach ($feature in $Epic.features) {
            if ($feature.labels) {
                $allLabels += $feature.labels
            }
            
            # Story labels
            if ($feature.stories) {
                foreach ($story in $feature.stories) {
                    if ($story.labels) {
                        $allLabels += $story.labels
                    }
                }
            }
        }
    }
    
    return $allLabels | Select-Object -Unique
}

function Format-AcceptanceCriteria {
    param([array]$Criteria)
    
    if (-not $Criteria -or $Criteria.Count -eq 0) {
        return ""
    }
    
    $formatted = "`n`n## Acceptance Criteria`n`n"
    foreach ($criterion in $Criteria) {
        $formatted += "- [ ] $criterion`n"
    }
    
    return $formatted
}

function Create-Issue {
    param(
        [string]$Title,
        [string]$Body,
        [array]$Labels,
        [int]$ParentIssueNumber = 0,
        [string]$IssueType = "ISSUE"
    )
    
    # Add parent reference to body
    $fullBody = $Body
    if ($ParentIssueNumber -gt 0) {
        $fullBody = "**Parent Issue:** #$ParentIssueNumber`n`n$Body"
    }
    
    Log "Creating [$IssueType] $Title" "INFO"
    
    if ($DRY_RUN) {
        $Script:SimCounter++
        $issueNumber = $Script:SimCounter
        
        Log "  DRY-RUN: Would create issue #$issueNumber" "DRY-RUN"
        Log "    Labels: $($Labels -join ', ')" "DRY-RUN"
        Log "    Parent: $(if ($ParentIssueNumber -gt 0) { "#$ParentIssueNumber" } else { 'None' })" "DRY-RUN"
        Log "    Body length: $($fullBody.Length) chars" "DRY-RUN"
        
        return $issueNumber
    }
    
    try {
        # Build gh issue create command
        $createArgs = @(
            "issue", "create",
            "--repo", "$OWNER/$REPO",
            "--title", $Title,
            "--body", $fullBody
        )
        
        # Add labels if present
        if ($Labels -and $Labels.Count -gt 0) {
            $createArgs += "--label"
            $createArgs += ($Labels -join ",")
        }
        
        # Create issue
        $issueUrl = & gh @createArgs 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            # Retry without labels if label error
            if ($issueUrl -like "*not found*" -and $issueUrl -like "*label*") {
                Log "    Warning: Some labels don't exist, retrying without labels..." "WARN"
                
                $createArgsNoLabels = @(
                    "issue", "create",
                    "--repo", "$OWNER/$REPO",
                    "--title", $Title,
                    "--body", $fullBody
                )
                
                $issueUrl = & gh @createArgsNoLabels 2>&1
                
                if ($LASTEXITCODE -ne 0) {
                    Log "  Failed to create issue: $Title" "ERROR"
                    return 0
                }
            }
            else {
                Log "  Failed to create issue: $Title - $issueUrl" "ERROR"
                return 0
            }
        }
        
        $issueNumber = ($issueUrl -split "/")[-1]
        Log "  Created issue #$issueNumber" "SUCCESS"
        Log "    URL: $issueUrl" "INFO"
        
        # Add to project
        Start-Sleep -Milliseconds 500
        
        $addResult = gh project item-add $PROJECT_NUMBER --owner $OWNER --url $issueUrl 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log "    Added to project #$PROJECT_NUMBER" "SUCCESS"
        }
        else {
            Log "    Failed to add to project: $addResult" "WARN"
        }
        
        return $issueNumber
    }
    catch {
        Log "  Error creating issue '$Title': $_" "ERROR"
        return 0
    }
}

function Link-ChildToParent {
    param(
        [int]$ChildNumber,
        [int]$ParentNumber,
        [string]$ChildTitle,
        [string]$ParentTitle
    )

    if ($DRY_RUN) {
        Log "  DRY-RUN: Would link #$ChildNumber as sub-issue of #$ParentNumber (via REST API)" "DRY-RUN"
        return
    }

    Log "  Linking #$ChildNumber as sub-issue of #$ParentNumber (via REST API)..." "INFO"

    try {
        # The REST API requires sub_issue_id = issue 'id' (not issue number)
        $childIssue = gh api "repos/$OWNER/$REPO/issues/$ChildNumber" --jq "{id: .id, number: .number}" | ConvertFrom-Json
        $childId = [long]$childIssue.id

        # POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues  body: { sub_issue_id: <id> }
        # Docs recommend Accept: application/vnd.github+json
        $apiResult = gh api `
          --method POST `
            -H "Accept: application/vnd.github+json" `
            /repos/$OWNER/$REPO/issues/$ParentNumber/sub_issues `
            -F "sub_issue_id=$childId" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Log "  ✓ Linked #$ChildNumber as sub-issue of parent #$ParentNumber" "SUCCESS"
            Start-Sleep -Milliseconds 300
            return
        }

        Log "  Native sub-issue API link failed; falling back to tasklist. Details: $apiResult" "WARN"
    }
    catch {
        Log "  Native sub-issue API link errored; falling back to tasklist. Details: $_" "WARN"
    }

    # ---- Fallback: tasklist on parent issue body (your existing behavior) ----
    try {
        Log "  Using tasklist as fallback..." "INFO"

        $parentIssue = gh issue view $ParentNumber --repo "$OWNER/$REPO" --json body | ConvertFrom-Json
        $parentBody = $parentIssue.body

        if ($parentBody -notmatch "## Sub-Issues") {
            $parentBody += "`n`n## Sub-Issues`n"
        }

        $parentBody += "- [ ] #$ChildNumber`n"

        gh issue edit $ParentNumber --repo "$OWNER/$REPO" --body $parentBody 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Log "  ✓ Added #$ChildNumber to parent #$ParentNumber as tasklist item" "SUCCESS"
        }
        else {
            Log "  ✗ Failed to link issues using fallback tasklist" "ERROR"
        }
    }
    catch {
        Log "  ✗ Error during fallback tasklist linking: $_" "ERROR"
    }

    Start-Sleep -Milliseconds 300
}

# ------------- MAIN PROCESSING ----------------
function Process-Stories {
    param(
        [array]$Stories,
        [int]$ParentIssueNumber
    )
    
    Log "`n--- Processing Stories for Feature #$ParentIssueNumber ---" "INFO"
    
    foreach ($story in $Stories) {
        # Format body with acceptance criteria
        $storyBody = $story.body
        if ($story.acceptanceCriteria) {
            $storyBody += Format-AcceptanceCriteria -Criteria $story.acceptanceCriteria
        }
        
        # Create story issue
        $storyNumber = Create-Issue -Title $story.title -Body $storyBody -Labels $story.labels -ParentIssueNumber $ParentIssueNumber -IssueType "STORY"
        
        if ($storyNumber -gt 0) {
            # Track created issue
            $Script:IssueMap[$story.title] = $storyNumber
            
            # Link to parent
            Start-Sleep -Milliseconds 200
            Link-ChildToParent -ChildNumber $storyNumber -ParentNumber $ParentIssueNumber -ChildTitle $story.title -ParentTitle "Feature"
        }
    }
}

function Process-Features {
    param(
        [array]$Features,
        [int]$ParentIssueNumber
    )
    
    Log "`n--- Processing Features for Epic #$ParentIssueNumber ---" "INFO"
    
    foreach ($feature in $Features) {
        # Create feature issue
        $featureNumber = Create-Issue -Title $feature.title -Body $feature.body -Labels $feature.labels -ParentIssueNumber $ParentIssueNumber -IssueType "FEATURE"
        
        if ($featureNumber -gt 0) {
            # Track created issue
            $Script:IssueMap[$feature.title] = $featureNumber
            
            # Link to parent
            Start-Sleep -Milliseconds 200
            Link-ChildToParent -ChildNumber $featureNumber -ParentNumber $ParentIssueNumber -ChildTitle $feature.title -ParentTitle "Epic"
            
            # Process child stories
            if ($feature.stories -and $feature.stories.Count -gt 0) {
                Process-Stories -Stories $feature.stories -ParentIssueNumber $featureNumber
            }
        }
    }
}

function Process-Epic {
    param([object]$Epic)
    
    Log "=============================================================" "INFO"
    Log "Processing Epic: $($Epic.title)" "INFO"
    Log "=============================================================" "INFO"
    
    # Create epic issue
    $epicNumber = Create-Issue -Title $Epic.title -Body $Epic.body -Labels $Epic.labels -IssueType "EPIC"
    
    if ($epicNumber -gt 0) {
        # Track created issue
        $Script:IssueMap[$Epic.title] = $epicNumber
        
        # Process child features
        if ($Epic.features -and $Epic.features.Count -gt 0) {
            Start-Sleep -Milliseconds 500
            Process-Features -Features $Epic.features -ParentIssueNumber $epicNumber
        }
    }
}

# ------------- SCRIPT EXECUTION ----------------
function Main {
    Log "============================================" "INFO"
    Log "GitHub Issues Hierarchy Creator" "INFO"
    Log "============================================" "INFO"
    Log "Configuration:" "INFO"
    Log "  Owner: $OWNER" "INFO"
    Log "  Repo: $REPO" "INFO"
    Log "  Issues File: $ISSUES_FILE" "INFO"
    Log "  Project Number: $PROJECT_NUMBER" "INFO"
    Log "  Dry Run: $DRY_RUN" $(if ($DRY_RUN) { "DRY-RUN" } else { "WARN" })
    Log "  Auto Create Labels: $AUTO_CREATE_LABELS" "INFO"
    Log "============================================`n" "INFO"
    
    # Check GitHub CLI
    if (-not (Test-GitHubCLI)) {
        exit 1
    }
    
    # Check GitHub authentication
    if (-not (Test-GitHubAuth)) {
        exit 1
    }
    
    # Verify project exists
    if (-not $DRY_RUN) {
        try {
            Log "Verifying project #$PROJECT_NUMBER exists..." "INFO"
            $projectInfo = gh project view $PROJECT_NUMBER --owner $OWNER --format json | ConvertFrom-Json
            Log "Project verified: $($projectInfo.title)" "SUCCESS"
        }
        catch {
            Log "Failed to access project #$PROJECT_NUMBER : $_" "ERROR"
            exit 1
        }
    }
    
    # Check if issues file exists
    if (-not (Test-Path $ISSUES_FILE)) {
        Log "ERROR: Issues file not found: $ISSUES_FILE" "ERROR"
        exit 1
    }
    
    # Load JSON
    Log "Loading issues from: $ISSUES_FILE" "INFO"
    try {
        $jsonContent = Get-Content $ISSUES_FILE -Raw | ConvertFrom-Json
    }
    catch {
        Log "ERROR: Failed to parse JSON file: $($_.Exception.Message)" "ERROR"
        exit 1
    }
    
    # Collect all labels from hierarchy
    $allLabels = Collect-AllLabels -Epic $jsonContent.epic
    Log "Found $($allLabels.Count) unique labels in JSON" "INFO"
    
    # Ensure labels exist
    Ensure-Labels -RequiredLabels $allLabels
    
    # Process epic and its hierarchy
    Process-Epic -Epic $jsonContent.epic
    
    # Summary
    Log "========================================" "INFO"
    Log "SUMMARY" "INFO"
    Log "========================================" "INFO"
    Log "Total issues processed: $($Script:IssueMap.Count)" "SUCCESS"
    Log "`nIssue Mapping:" "INFO"
    foreach ($key in $Script:IssueMap.Keys | Sort-Object) {
        Log "  $key -> #$($Script:IssueMap[$key])" "INFO"
    }
    Log "========================================`n" "INFO"
    
    if ($DRY_RUN) {
        Log "✓ This was a DRY-RUN. No actual issues were created." "DRY-RUN"
        Log "✓ Set `$DRY_RUN = `$false to create issues for real." "DRY-RUN"
    }
    else {
        Log "✓ All issues created successfully!" "SUCCESS"
        Log "✓ View issues at: https://github.com/$OWNER/$REPO/issues" "SUCCESS"
    }
}

# Run the script
Main