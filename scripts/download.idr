import System
import System.File
import System.Directory
import Data.String
import Data.List

outDir : String
outDir = "C:/msys64/home/natanh/docs/the-verge-of-redemption"

tmp : String
tmp = "C:/msys64/tmp/substack-dl"

-- Run a command via bash
run : String -> IO Int
run cmd = do
  Right _ <- writeFile (tmp ++ "/cmd.sh") cmd
    | Left _ => pure 1
  system ("bash " ++ tmp ++ "/cmd.sh")

-------------------------------------------------------------------
-- JSON helpers: extract a string value right after "key":
-- Must properly skip over JSON string values to avoid matching
-- inside body_html or other large string fields
-------------------------------------------------------------------

-- Skip a JSON string value (past closing quote, handling escapes)
skipJsonString : List Char -> List Char
skipJsonString [] = []
skipJsonString ('\\' :: _ :: rest) = skipJsonString rest
skipJsonString ('"' :: rest) = rest
skipJsonString (_ :: rest) = skipJsonString rest

-- Get a JSON string value (between quotes, handling escapes)
readJsonString : List Char -> (String, List Char)
readJsonString cs = let (val, rest) = go cs in (pack val, rest)
  where
    go : List Char -> (List Char, List Char)
    go [] = ([], [])
    go ('\\' :: '"' :: r) = let (v, r') = go r in ('"' :: v, r')
    go ('\\' :: 'n' :: r) = let (v, r') = go r in ('\n' :: v, r')
    go ('\\' :: '\\' :: r) = let (v, r') = go r in ('\\' :: v, r')
    go ('\\' :: '/' :: r) = let (v, r') = go r in ('/' :: v, r')
    go ('\\' :: 'u' :: a :: b :: c :: d :: r) = let (v, r') = go r in ('?' :: v, r')  -- unicode escape placeholder
    go ('"' :: r) = ([], r)
    go (c :: r) = let (v, r') = go r in (c :: v, r')

-- Skip whitespace
skipWs : List Char -> List Char
skipWs (' ' :: r) = skipWs r
skipWs ('\n' :: r) = skipWs r
skipWs ('\r' :: r) = skipWs r
skipWs ('\t' :: r) = skipWs r
skipWs r = r

-- Find a key in current JSON object level and return its string value
-- This properly skips nested strings so we don't match keys inside values
findKeyValue : String -> List Char -> Maybe (String, List Char)
findKeyValue key cs = go (unpack key) cs
  where
    matchKey : List Char -> List Char -> Maybe (List Char)
    matchKey [] ('"' :: rest) = Just rest  -- key must end with closing quote
    matchKey [] _ = Nothing
    matchKey (k :: ks) (c :: rest) = if k == c then matchKey ks rest else Nothing
    matchKey _ [] = Nothing

    go : List Char -> List Char -> Maybe (String, List Char)
    go _ [] = Nothing
    go needle ('"' :: rest) =
      -- We hit a quoted string. Check if it matches our key
      case matchKey needle rest of
        Just afterKey =>
          -- Check if next non-ws char is ':'
          let afterColon = skipWs afterKey in
          case afterColon of
            (':' :: afterC) =>
              let afterVal = skipWs afterC in
              case afterVal of
                ('"' :: valStart) => Just (readJsonString valStart)
                _ => go needle rest  -- value isn't a string
            _ => go needle rest  -- not a key:value pair
        Nothing =>
          -- Not our key - skip this string value entirely
          go needle (skipJsonString rest)
    go needle (_ :: rest) = go needle rest

-------------------------------------------------------------------
-- Extract all slugs from archive JSON
-- Finds every "slug":"value" properly
-------------------------------------------------------------------
extractSlugs : String -> List String
extractSlugs json = go (unpack json)
  where
    go : List Char -> List String
    go [] = []
    go ('"' :: 's' :: 'l' :: 'u' :: 'g' :: '"' :: rest) =
      let rest2 = skipWs rest in
      case rest2 of
        (':' :: rest3) =>
          let rest4 = skipWs rest3 in
          case rest4 of
            ('"' :: rest5) =>
              let (slug, rest6) = readJsonString rest5
              in slug :: go rest6
            _ => go rest4
        _ => go rest2
    -- Skip any other quoted string to avoid matching inside values
    go ('"' :: rest) = go (skipJsonString rest)
    go (_ :: rest) = go rest

-------------------------------------------------------------------
-- HTML to Markdown converter
-------------------------------------------------------------------
htmlToMd : String -> String
htmlToMd = pack . go . unpack
  where
    skipTag : List Char -> List Char
    skipTag [] = []
    skipTag ('>' :: rest) = rest
    skipTag (_ :: rest) = skipTag rest

    readUntil : List Char -> List Char -> (List Char, List Char)
    readUntil close [] = ([], [])
    readUntil close hay =
      if isPrefixOf close hay then ([], drop (length close) hay)
      else case hay of
        (c :: rest) => let (inner, r) = readUntil close rest in (c :: inner, r)
        [] => ([], [])

    extractHref : List Char -> (List Char, List Char)
    extractHref cs = go2 cs
      where
        go2 : List Char -> (List Char, List Char)
        go2 [] = ([], [])
        go2 ('>' :: rest) = ([], rest)
        go2 ('h' :: 'r' :: 'e' :: 'f' :: '=' :: '"' :: rest) =
          let (url, after) = readUntil ['"'] rest in (url, skipTag after)
        go2 ('h' :: 'r' :: 'e' :: 'f' :: '=' :: '\'' :: rest) =
          let (url, after) = readUntil ['\''] rest in (url, skipTag after)
        go2 (_ :: rest) = go2 rest

    go : List Char -> List Char
    go [] = []
    go ('<' :: 'h' :: n :: rest) =
      if n >= '1' && n <= '6'
        then let after = skipTag rest
                 (inner, rest2) = readUntil (unpack ("</h" ++ singleton n ++ ">")) after
                 hashes = replicate (cast (ord n - ord '0')) '#'
             in '\n' :: (hashes ++ (' ' :: go inner ++ ('\n' :: '\n' :: go rest2)))
        else '<' :: 'h' :: n :: go rest
    go ('<' :: 's' :: 't' :: 'r' :: 'o' :: 'n' :: 'g' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</strong>") after
      in '*' :: '*' :: (go inner ++ ('*' :: '*' :: go rest2))
    go ('<' :: 'e' :: 'm' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</em>") after
      in '*' :: (go inner ++ ('*' :: go rest2))
    go ('<' :: 'a' :: ' ' :: rest) =
      let (href, after) = extractHref rest
          (inner, rest2) = readUntil (unpack "</a>") after
      in '[' :: (go inner ++ (']' :: '(' :: (href ++ (')' :: go rest2))))
    go ('<' :: 'b' :: 'r' :: rest) = '\n' :: go (skipTag rest)
    go ('<' :: '/' :: 'p' :: '>' :: rest) = '\n' :: '\n' :: go rest
    go ('<' :: 'l' :: 'i' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</li>") after
      in '-' :: ' ' :: (go inner ++ ('\n' :: go rest2))
    go ('<' :: 'b' :: 'l' :: 'o' :: 'c' :: 'k' :: 'q' :: rest) =
      let after = skipTag rest
          (inner, rest2) = readUntil (unpack "</blockquote>") after
      in '\n' :: '>' :: ' ' :: (go inner ++ ('\n' :: '\n' :: go rest2))
    go ('<' :: 'h' :: 'r' :: rest) = '\n' :: '\n' :: '-' :: '-' :: '-' :: '\n' :: '\n' :: go (skipTag rest)
    go ('<' :: rest) = go (skipTag rest)
    go ('&' :: 'a' :: 'm' :: 'p' :: ';' :: rest) = '&' :: go rest
    go ('&' :: 'l' :: 't' :: ';' :: rest) = '<' :: go rest
    go ('&' :: 'g' :: 't' :: ';' :: rest) = '>' :: go rest
    go ('&' :: 'q' :: 'u' :: 'o' :: 't' :: ';' :: rest) = '"' :: go rest
    go ('&' :: '#' :: 'x' :: '2' :: '7' :: ';' :: rest) = '\'' :: go rest
    go ('&' :: 'n' :: 'b' :: 's' :: 'p' :: ';' :: rest) = ' ' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '1' :: '7' :: ';' :: rest) = '-' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '1' :: '6' :: ';' :: rest) = '-' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '2' :: '0' :: ';' :: rest) = '\'' :: go rest
    go ('&' :: '#' :: '8' :: '2' :: '2' :: '1' :: ';' :: rest) = '\'' :: go rest
    go ('&' :: '#' :: rest) =
      -- skip numeric entity
      let afterSemicolon = dropWhile (/= ';') rest in
      case afterSemicolon of
        (';' :: r) => go r
        _ => go rest
    go (c :: rest) = c :: go rest

-------------------------------------------------------------------
-- Timestamps: track updated_at per slug
-------------------------------------------------------------------
timestampsFile : String
timestampsFile = outDir ++ "/.timestamps"

readTimestamps : IO (List (String, String))
readTimestamps = do
  Right content <- readFile timestampsFile
    | Left _ => pure []
  pure $ mapMaybe parseLine (lines content)
  where
    parseLine : String -> Maybe (String, String)
    parseLine line =
      case break (== '\t') (trim line) of
        (slug, rest) =>
          if slug == "" || rest == "" then Nothing
          else Just (slug, assert_total (strTail rest))

writeTimestamps : List (String, String) -> IO ()
writeTimestamps ts = do
  let content = concatMap (\(s, u) => s ++ "\t" ++ u ++ "\n") ts
  _ <- writeFile timestampsFile content
  pure ()

lookupTs : String -> List (String, String) -> Maybe String
lookupTs slug [] = Nothing
lookupTs slug ((s, u) :: rest) = if s == slug then Just u else lookupTs slug rest

updateTs : String -> String -> List (String, String) -> List (String, String)
updateTs slug upd [] = [(slug, upd)]
updateTs slug upd ((s, u) :: rest) =
  if s == slug then (s, upd) :: rest
  else (s, u) :: updateTs slug upd rest

-------------------------------------------------------------------
-- Process one article: fetch JSON, check if update needed, save
-------------------------------------------------------------------
processArticle : String -> List (String, String) -> IO (List (String, String))
processArticle slug ts = do
  let json = tmp ++ "/" ++ slug ++ ".json"
  let out  = outDir ++ "/" ++ slug ++ ".md"
  0 <- run ("curl -s 'https://davidhoze.substack.com/api/v1/posts/" ++ slug ++ "' -o '" ++ json ++ "'")
    | _ => do putStrLn ("  " ++ slug ++ ": FAILED to fetch"); pure ts
  Right rawJson <- readFile json
    | Left _ => do putStrLn ("  " ++ slug ++ ": FAILED to read"); pure ts
  let chars = unpack rawJson
  -- Check if response has body_html (skip error responses)
  let mbBody = findKeyValue "body_html" chars
  case mbBody of
    Nothing => do putStrLn ("  " ++ slug ++ ": skipped (no body_html in response)"); pure ts
    Just (body, _) => do
      let updatedAt = case findKeyValue "updated_at" chars of
                        Just (u, _) => u
                        Nothing => ""
      -- Check if file exists
      fileExists <- do
        Right f <- openFile out Read
          | Left _ => pure False
        closeFile f
        pure True
      let storedTs = lookupTs slug ts
      let needSave = not fileExists || storedTs /= Just updatedAt
      if needSave
        then do
          let title = case findKeyValue "title" chars of
                        Just (t, _) => t
                        Nothing => slug
          let subtitle = case findKeyValue "subtitle" chars of
                           Just (s, _) => if s == "" then "" else ": " ++ s
                           Nothing => ""
          let md = htmlToMd body
          Right _ <- writeFile out ("# " ++ title ++ subtitle ++ "\n\n" ++ md)
            | Left _ => do putStrLn ("  " ++ slug ++ ": FAILED to write"); pure ts
          putStrLn ("  " ++ slug ++ (if fileExists then " (updated)" else " (new)"))
          pure (updateTs slug updatedAt ts)
        else pure (updateTs slug updatedAt ts)

-------------------------------------------------------------------
-- Fetch all slugs with pagination
-------------------------------------------------------------------
fetchAllSlugs : Nat -> List String -> IO (List String)
fetchAllSlugs offset acc = do
  let url = "https://davidhoze.substack.com/api/v1/archive?sort=new&limit=25&offset=" ++ show offset
  0 <- run ("curl -s '" ++ url ++ "' -o '" ++ tmp ++ "/page.json'")
    | _ => do putStrLn "  failed to fetch page"; pure acc
  Right pageJson <- readFile (tmp ++ "/page.json")
    | Left _ => pure acc
  let slugs = extractSlugs pageJson
  case slugs of
    [] => pure acc
    _  => fetchAllSlugs (offset + length slugs) (acc ++ slugs)

-------------------------------------------------------------------
-- Check if a string contains a substring
-------------------------------------------------------------------
contains : String -> String -> Bool
contains needle haystack = go (unpack needle) (unpack haystack)
  where
    startsWith : List Char -> List Char -> Bool
    startsWith [] _ = True
    startsWith _ [] = False
    startsWith (n :: ns) (h :: hs) = n == h && startsWith ns hs

    go : List Char -> List Char -> Bool
    go _ [] = False
    go nd (h :: hs) = startsWith nd (h :: hs) || go nd hs

-------------------------------------------------------------------
-- Split at first blank line (\n\n)
-------------------------------------------------------------------
splitAtFirstBlank : String -> (String, String)
splitAtFirstBlank s = go [] (unpack s)
  where
    go : List Char -> List Char -> (String, String)
    go acc [] = (pack (reverse acc), "")
    go acc ('\n' :: '\n' :: rest) = (pack (reverse acc), pack rest)
    go acc (c :: rest) = go (c :: acc) rest

-------------------------------------------------------------------
-- Patch locally-written articles with cover images from Substack
-------------------------------------------------------------------
patchImage : String -> IO Bool
patchImage slug = do
  let out  = outDir ++ "/" ++ slug ++ ".md"
  let json = tmp ++ "/" ++ slug ++ ".json"
  Right content <- readFile out
    | Left _ => pure False
  -- Skip if already has image block
  if contains "[- -" content
    then pure False
    else do
      -- JSON should be in tmp from the download phase; fetch if missing
      jsonExists <- do
        Right f <- openFile json Read
          | Left _ => pure False
        closeFile f
        pure True
      when (not jsonExists) $ do
        _ <- run ("curl -s 'https://davidhoze.substack.com/api/v1/posts/" ++ slug ++ "' -o '" ++ json ++ "'")
        pure ()
      Right rawJson <- readFile json
        | Left _ => do putStrLn ("  " ++ slug ++ ": no JSON available"); pure False
      case findKeyValue "cover_image" (unpack rawJson) of
        Nothing => do putStrLn ("  " ++ slug ++ ": no cover_image in API"); pure False
        Just ("", _) => do putStrLn ("  " ++ slug ++ ": empty cover_image"); pure False
        Just (url, _) => do
          let (title, rest) = splitAtFirstBlank content
          let patched = title ++ "\n\n[- - \n\n](" ++ url ++ ")" ++ rest
          Right _ <- writeFile out patched
            | Left _ => do putStrLn ("  " ++ slug ++ ": failed to write"); pure False
          putStrLn ("  " ++ slug ++ ": added image")
          pure True

patchAll : List String -> Nat -> IO ()
patchAll [] n = putStrLn (show n ++ " images patched")
patchAll (s :: rest) n = do
  patched <- patchImage s
  patchAll rest (if patched then S n else n)

-------------------------------------------------------------------
main : IO ()
main = do
  _ <- createDir tmp
  stored <- readTimestamps
  putStrLn "Fetching index..."
  slugs <- fetchAllSlugs 0 []
  putStrLn (show (length slugs) ++ " articles found")
  finalTs <- processAll slugs stored 0
  writeTimestamps finalTs
  putStrLn "Patching images..."
  patchAll slugs 0
  putStrLn "Done."
  where
    processAll : List String -> List (String, String) -> Nat -> IO (List (String, String))
    processAll [] ts n = do
      putStrLn (show n ++ " downloaded/updated")
      pure ts
    processAll (s :: rest) ts n = do
      oldLen <- pure (length ts)
      ts' <- processArticle s ts
      let saved = lookupTs s ts /= lookupTs s ts'
                  || length ts' /= oldLen
      processAll rest ts' (if saved then S n else n)
