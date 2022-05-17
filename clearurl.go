package reader

import (
	"regexp"

	"github.com/whitekid/goxp/fx"
	"github.com/whitekid/goxp/log"
)

// from clearurls global rules
var removeRules = []string{
	`(?:%3F)?utm(?:_[a-z_]*)?`,
	`(?:%3F)?ga_[a-z_]+`,
	`(?:%3F)?yclid`,
	`(?:%3F)?_openstat`,
	`(?:%3F)?fb_action_(?:types|ids)`,
	`(?:%3F)?fb_(?:source|ref)`,
	`(?:%3F)?fbclid`,
	`(?:%3F)?action_(?:object|type|ref)_map`,
	`(?:%3F)?gs_l`,
	`(?:%3F)?mkt_tok`,
	`(?:%3F)?hmb_(?:campaign|medium|source)`,
	`(?:%3F)?ref_?`,
	`(?:%3F)?referrer`,
	`(?:%3F)?gclid`,
	`(?:%3F)?otm_[a-z_]*`,
	`(?:%3F)?cmpid`,
	`(?:%3F)?os_ehash`,
	`(?:%3F)?_ga`,
	`(?:%3F)?_gl`,
	`(?:%3F)?__twitter_impression`,
	`(?:%3F)?wt_?z?mc`,
	`(?:%3F)?wtrid`,
	`(?:%3F)?[a-z]?mc`,
	`(?:%3F)?dclid`,
	`Echobox`,
	`(?:%3F)?spm`,
	`(?:%3F)?vn(?:_[a-z]*)+`,
	`(?:%3F)?tracking_source`,
	`(?:%3F)?ceneo_spo`,
}

var redirectRules = [][]string{
	{`^https://blog.naver.com/(\w+)/(\w+)`, `https://m.blog.naver.com/$1/$2`},
	{`^https://m.blog.naver.com/PostView.naver\?blogId=(\w+)&logNo=(\w+).*`, `https://m.blog.naver.com/$1/$2`},
	{`^https://(.+).tistory.com/(\d+)`, `https://$1.tistory.com/m/$2`},
	{`^https://infuture.kr/(\d+)`, `https://infutureconsulting.tistory.com/m/$1`},
}

var (
	removeRuleExps   []*regexp.Regexp
	redirectRuleExps []*redirectMap
)

type redirectMap struct {
	Regex *regexp.Regexp
	Repl  string
}

func init() {
	removeRuleExps = fx.Map(removeRules, func(rule string) *regexp.Regexp {
		return regexp.MustCompile(rule + `\=[a-zA-Z0-9_]+&{0,1}`)
	})

	redirectRuleExps = fx.Map(redirectRules, func(rules []string) *redirectMap {
		return &redirectMap{
			Regex: regexp.MustCompile(rules[0]),
			Repl:  rules[1],
		}
	})
}

func cleanURL(url string) string {
	log.Debugf("before clean url: %s", url)

	fx.ForEach(removeRuleExps, func(_ int, exp *regexp.Regexp) { url = exp.ReplaceAllString(url, "") })
	fx.ForEach(redirectRuleExps, func(_ int, rd *redirectMap) { url = rd.Regex.ReplaceAllString(url, rd.Repl) })

	log.Debugf("after clean url: %s", url)
	return url
}
