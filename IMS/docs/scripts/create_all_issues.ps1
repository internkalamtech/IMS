# ============================================================================
# GitHub Issues Hierarchy Creator with Deduplication
# Creates Epic → Feature → Story hierarchy from JSON files
# Skips issues that already exist with the same title
# ============================================================================

# ------------- CONFIG ----------------
$DRY_RUN = $false
$REQUIREMENTS_DIR = "../requirements"
$PROJECT_NUMBER = 4
$OWNER = "internkalamtech"
$REPO = "IMS"
$AUTO_CREATE_LABELS = $true
# -------------------------------------

# ------------- GLOBALS ----------------
$Script:IssueMap = @{}
$Script:ExistingIssues = @{}
$Script:SkippedCount = 0

# ------------- LOGGING ----------------
function Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $colors = @{ "INFO" = "White"; "SUCCESS" = "Green"; "WARN" = "Yellow"; "ERROR" = "Red"; "SKIP" = "Cyan" }
    $color = if ($colors.ContainsKey($Level)) { $colors[$Level] } else { "White" }
    Write-Host "[$timestamp][$Level] $Message" -ForegroundColor $color
}

# ------------- GITHUB HELPERS ----------------
function Load-ExistingIssues {
    Log "Loading existing issues from repository..." "INFO"
    try {
        $existingIssues = gh issue list --repo "$OWNER/$REPO" --limit 1000 --state all --json number,title | ConvertFrom-Json
        foreach ($issue in $existingIssues) {
            $Script:ExistingIssues[$issue.title] = $issue.number
        }
        Log "Loaded $($Script:ExistingIssues.Count) existing issues" "SUCCESS"
    }
    catch {
        Log "Warning: Could not load existing issues" "WARN"
    }
}

function Get-UniqueRandomColor {
    param([hashtable]$UsedColors)
    $niceColors = @("8B5CF6", "3B82F6", "06B6D4", "10B981", "F59E0B", "EF4444", "EC4899", "A855F7", "0EA5E9", "14B8A6", "F97316", "84CC16", "EAB308", "6366F1")
    foreach ($color in $niceColors) {
        if (-not $UsedColors.ContainsKey($color.ToUpper())) {
            $UsedColors[$color.ToUpper()] = $true
            return $color
        }
    }
    return "9CA3AF"
}

function Ensure-Labels {
    param([array]$RequiredLabels)
    if (-not $AUTO_CREATE_LABELS) { return }
    
    $existingLabels = @{}
    $usedColors = @{}
    try {
        $existingLabelsList = gh label list --repo "$OWNER/$REPO" --json name,color | ConvertFrom-Json
        foreach ($label in $existingLabelsList) {
            $existingLabels[$label.name] = $label.color
            $usedColors[$label.color.ToUpper()] = $true
        }
    } catch { }
    
    $createdCount = 0
    foreach ($label in $RequiredLabels) {
        if (-not $existingLabels.ContainsKey($label)) {
            $color = Get-UniqueRandomColor -UsedColors $usedColors
            try {
                gh label create $label --repo "$OWNER/$REPO" --color $color --description "Auto-created" --force 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Log "  Created label: '$label'" "SUCCESS"
                    $createdCount++
                }
            } catch { }
            Start-Sleep -Milliseconds 100
        }
    }
    if ($createdCount -gt 0) {
        Log "Created $createdCount new label(s)" "SUCCESS"
    }
}

function Format-AcceptanceCriteria {
    param([array]$Criteria)
    if (-not $Criteria -or $Criteria.Count -eq 0) { return "" }
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
    
    # Check if issue already exists
    if ($Script:ExistingIssues.ContainsKey($Title)) {
        $existingNumber = $Script:ExistingIssues[$Title]
        Log "[$IssueType] $Title - Already exists as #$existingNumber" "SKIP"
        $Script:SkippedCount++
        return $existingNumber
    }
    
    # Check if we already created it in this session
    if ($Script:IssueMap.ContainsKey($Title)) {
        $existingNumber = $Script:IssueMap[$Title]
        Log "[$IssueType] $Title - Already created in this session as #$existingNumber" "SKIP"
        $Script:SkippedCount++
        return $existingNumber
    }
    
    $fullBody = $Body
    if ($ParentIssueNumber -gt 0) {
        $fullBody = "**Parent Issue:** #$ParentIssueNumber`n`n$Body"
    }
    
    Log "Creating [$IssueType] $Title" "INFO"
    
    if ($DRY_RUN) {
        Log "  DRY-RUN: Would create issue" "WARN"
        return 9999
    }
    
    try {
        $createArgs = @("issue", "create", "--repo", "$OWNER/$REPO", "--title", $Title, "--body", $fullBody)
        if ($Labels -and $Labels.Count -gt 0) {
            $createArgs += "--label"
            $createArgs += ($Labels -join ",")
        }
        
        $issueUrl = & gh @createArgs 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Log "  Failed to create issue: $Title" "ERROR"
            return 0
        }
        
        $issueNumber = ($issueUrl -split "/")[-1]
        Log "  Created issue #$issueNumber" "SUCCESS"
        
        # Add to tracking
        $Script:IssueMap[$Title] = $issueNumber
        $Script:ExistingIssues[$Title] = $issueNumber
        
        # Add to project
        Start-Sleep -Milliseconds 500
        gh project item-add $PROJECT_NUMBER --owner $OWNER --url $issueUrl 2>&1 | Out-Null
        
        return $issueNumber
    }
    catch {
        Log "  Error creating issue: $_" "ERROR"
        return 0
    }
}

function Link-ChildToParent {
    param([int]$ChildNumber, [int]$ParentNumber)
    if ($DRY_RUN) { return }
    
    try {
        $childIssue = gh api "repos/$OWNER/$REPO/issues/$ChildNumber" --jq "{id: .id}" | ConvertFrom-Json
        $childId = [long]$childIssue.id
        
        gh api --method POST -H "Accept: application/vnd.github+json" /repos/$OWNER/$REPO/issues/$ParentNumber/sub_issues -F "sub_issue_id=$childId" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Log "  Linked #$ChildNumber to parent #$ParentNumber" "SUCCESS"
        }
    }
    catch { }
    
    Start-Sleep -Milliseconds 300
}

# ------------- PROCESSING ----------------
function Process-Stories {
    param([array]$Stories, [int]$ParentIssueNumber)
    
    foreach ($story in $Stories) {
        $storyBody = $story.body
        if ($story.acceptanceCriteria) {
            $storyBody += Format-AcceptanceCriteria -Criteria $story.acceptanceCriteria
        }
        
        $storyNumber = Create-Issue -Title $story.title -Body $storyBody -Labels $story.labels -ParentIssueNumber $ParentIssueNumber -IssueType "STORY"
        
        if ($storyNumber -gt 0) {
            Start-Sleep -Milliseconds 200
            Link-ChildToParent -ChildNumber $storyNumber -ParentNumber $ParentIssueNumber
        }
    }
}

function Process-Features {
    param([array]$Features, [int]$ParentIssueNumber)
    
    foreach ($feature in $Features) {
        $featureNumber = Create-Issue -Title $feature.title -Body $feature.body -Labels $feature.labels -ParentIssueNumber $ParentIssueNumber -IssueType "FEATURE"
        
        if ($featureNumber -gt 0) {
            Start-Sleep -Milliseconds 200
            Link-ChildToParent -ChildNumber $featureNumber -ParentNumber $ParentIssueNumber
            
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
    
    $epicNumber = Create-Issue -Title $Epic.title -Body $Epic.body -Labels $Epic.labels -IssueType "EPIC"
    
    if ($epicNumber -gt 0) {
        if ($Epic.features -and $Epic.features.Count -gt 0) {
            Start-Sleep -Milliseconds 500
            Process-Features -Features $Epic.features -ParentIssueNumber $epicNumber
        }
    }
}

function Collect-AllLabels {
    param([object]$Epic)
    $allLabels = @()
    if ($Epic.labels) { $allLabels += $Epic.labels }
    if ($Epic.features) {
        foreach ($feature in $Epic.features) {
            if ($feature.labels) { $allLabels += $feature.labels }
            if ($feature.stories) {
                foreach ($story in $feature.stories) {
                    if ($story.labels) { $allLabels += $story.labels }
                }
            }
        }
    }
    return $allLabels | Select-Object -Unique
}

# ------------- MAIN ----------------
function Main {
    Log "============================================" "INFO"
    Log "GitHub Issues Hierarchy Creator" "INFO"
    Log "============================================" "INFO"
    Log "Owner/Repo: $OWNER/$REPO" "INFO"
    Log "Requirements Dir: $REQUIREMENTS_DIR" "INFO"
    Log "Dry Run: $DRY_RUN" $(if ($DRY_RUN) { "WARN" } else { "INFO" })
    Log "============================================" "INFO"
    
    # Get script directory
    $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
    $requirementsPath = Join-Path $scriptDir $REQUIREMENTS_DIR
    $jsonFiles = Get-ChildItem -Path $requirementsPath -Filter "*.json" | Sort-Object Name
    
    if ($jsonFiles.Count -eq 0) {
        Log "ERROR: No JSON files found in: $requirementsPath" "ERROR"
        exit 1
    }
    
    Log "Found $($jsonFiles.Count) JSON files to process" "SUCCESS"
    
    if (-not $DRY_RUN) {
        Write-Host ""
        Write-Host "WARNING: This will create issues in GitHub!" -ForegroundColor Yellow
        $confirmation = Read-Host "Continue? (yes/no)"
        if ($confirmation -ne "yes") {
            Log "Cancelled by user" "WARN"
            exit 0
        }
    }
    
    # Load existing issues for deduplication
    Load-ExistingIssues
    
    # Process each JSON file
    $totalCreated = 0
    $startTime = Get-Date
    
    foreach ($file in $jsonFiles) {
        Log "" "INFO"
        Log "========================================" "INFO"
        Log "Processing: $($file.Name)" "INFO"
        Log "========================================" "INFO"
        
        try {
            $jsonContent = Get-Content $file.FullName -Raw | ConvertFrom-Json
            
            # Collect and ensure labels
            $allLabels = Collect-AllLabels -Epic $jsonContent.epic
            Ensure-Labels -RequiredLabels $allLabels
            
            # Process the epic
            $beforeCount = $Script:IssueMap.Count
            Process-Epic -Epic $jsonContent.epic
            $created = $Script:IssueMap.Count - $beforeCount
            $totalCreated += $created
            
            Log "Completed: $($file.Name) - Created: $created, Skipped: $Script:SkippedCount" "SUCCESS"
        }
        catch {
            Log "Error processing $($file.Name): $_" "ERROR"
        }
        
        # Delay between files
        if ($file -ne $jsonFiles[-1]) {
            Log "Waiting 3 seconds..." "INFO"
            Start-Sleep -Seconds 3
        }
    }
    
    # Summary
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Log "" "INFO"
    Log "============================================" "INFO"
    Log "BATCH PROCESSING COMPLETE" "SUCCESS"
    Log "============================================" "INFO"
    Log "Files Processed: $($jsonFiles.Count)" "INFO"
    Log "Issues Created: $totalCreated" "SUCCESS"
    Log "Issues Skipped: $Script:SkippedCount" "INFO"
    Log "Duration: $($duration.ToString('mm\:ss'))" "INFO"
    Log "============================================" "INFO"
    Log "View issues: https://github.com/$OWNER/$REPO/issues" "SUCCESS"
}

# Run
Main
